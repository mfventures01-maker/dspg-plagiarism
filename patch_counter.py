import sys

def patch():
    with open('server.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add BatchCounterService import
    import_stmt = "import { BatchCounterService } from './src/services/BatchCounterService.js';\n"
    init_stmt = "const counterService = BatchCounterService.getInstance();\n"
    
    if "BatchCounterService" not in content:
        # Find where to inject
        idx = content.find("const batchService = BatchProcessingService.getInstance();")
        if idx != -1:
            idx += len("const batchService = BatchProcessingService.getInstance();\n")
            content = content[:idx] + import_stmt + init_stmt + content[idx:]

    # 2. Modify `/api/analyze` to increment the counter
    increment_code = """
    // ============================================
    // PUBLIC BATCH SECRET COUNTER
    // ============================================
    console.log('[COUNTER] Incrementing project counter...');
    const counterStats = counterService.incrementCounter();
    console.log(`[COUNTER] Total projects: ${counterStats.total}`);
    console.log(`[COUNTER] Today: ${counterStats.today}, Week: ${counterStats.week}, Month: ${counterStats.month}`);

    // Add counter stats to response
    responseData.data.counter = {
      total: counterStats.total,
      today: counterStats.today,
      week: counterStats.week,
      month: counterStats.month,
      lastProject: counterService.getStats().lastProjectTimestamp
    };
"""
    
    res_json_idx = content.find("res.json(responseData);")
    # Need to make sure we inject it before the last res.json(responseData) inside the try block
    # We'll search for the last occurrence of res.json(responseData) which should be inside /api/analyze
    
    if "counterStats = counterService.incrementCounter()" not in content:
        # The first occurrence is in /api/analyze based on our previous patch
        target_marker = "res.json(responseData);"
        first_idx = content.find(target_marker)
        if first_idx != -1:
            content = content[:first_idx] + increment_code + content[first_idx:]

    # 3. Add the counter endpoints
    endpoints_code = """
// ============================================
// PUBLIC COUNTER ENDPOINT
// ============================================
app.get('/api/counter/stats', (req, res) => {
  try {
    const stats = counterService.getStats();
    res.json({
      success: true,
      data: {
        totalProjects: stats.totalProjects,
        todayProjects: stats.todayProjects,
        thisWeekProjects: stats.thisWeekProjects,
        thisMonthProjects: stats.thisMonthProjects,
        averageDaily: stats.averageDaily,
        lastProjectTimestamp: stats.lastProjectTimestamp
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/secret-counter', (req, res) => {
  try {
    const secret = req.headers['x-admin-secret'];
    const validSecret = process.env.SUPERADMIN_SECRET;
    
    if (!validSecret || secret !== validSecret) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const stats = counterService.getStats();
    res.json({
      success: true,
      data: {
        totalProjects: stats.totalProjects,
        secretCounter: counterService.getSecretCounter(),
        dailyHistory: counterService.getDailyHistory()
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
"""

    if "/api/counter/stats" not in content:
        idx = content.find("async function start()")
        if idx != -1:
            content = content[:idx] + endpoints_code + content[idx:]

    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Patched server.ts")

patch()
