import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

import { GeminiProvider } from '../src/ai/providers/GeminiProvider';

const abstractText = `This project describes the design and implementation of an automated smart irrigation system utilizing an ATmega328P microcontroller integrated with capacitive soil moisture sensors and a water pump. Irrigation is one of the most vital agricultural practices in Nigeria, where drought and erratic rainfall patterns often threaten food security, especially in Delta State. Standard manual irrigation leads to massive water waste and inefficient labor resources. To resolve this challenge, the proposed system reads real-time moisture parameters from the soil and cross-references them against configured threshold limits. When the volumetric water content drops below 35%, the microcontroller triggers a 5V relay module which activates a submersible water pump. Once the soil reaches a saturated level of 75%, the controller deactivates the pump. This closed-loop automatic feedback loop ensures optimal moisture preservation and prevents root rot. The system incorporates an LCD screen to display the volumetric moisture percentages and current pump status. System reliability was verified across multiple soil configurations, indicating a 40% reduction in water usage compared to conventional timed-watering techniques. Future recommendations involve the integration of a LoRa module for remote telemetry monitoring across expansive polytechnic farm settlements.`;

const metadata = {
  projectTitle: "Design and Construction of a Microcontroller-Based Smart Irrigation System",
  department: "Computer Engineering",
  school: "School of Engineering",
  programme: "Higher National Diploma (HND)",
  level: "HND 2",
  session: "2023/2024",
  supervisor: "Engr. Brian Abugewa",
  submissionDate: "2026-07-23",
  students: [
    {
      fullName: "Okonkwo Chukwudi Emmanuel",
      matricNumber: "DSPG/HND/ENG/2024/0482",
      role: "Lead Developer"
    }
  ]
};

async function run() {
  const provider = new GeminiProvider();
  
  try {
    const response = await provider.analyzeDocument({
      prompt: `Analyze the following text for potential plagiarism or AI generation:\n\n${abstractText}`,
      systemPrompt: 'You are an expert academic integrity analyzer. Be precise and deterministic.',
      metadata: metadata,
      temperature: 0.1,
      maxTokens: 2048
    });
    console.log('Gemini Success Response:', JSON.stringify(response, null, 2));
  } catch (err: any) {
    console.error('Gemini Failed:');
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
  }
}

run();
