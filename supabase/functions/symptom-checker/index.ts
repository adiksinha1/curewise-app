import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, duration, severity, age } = await req.json();
    console.log("Analyzing symptoms:", { symptoms, duration, severity, age });

    // Get authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let medicalHistory: any = null;
    let pastSymptomChecks: Array<{
      symptoms: string;
      conditions_identified: string[] | null;
      severity_level: string | null;
      created_at: string;
    }> = [];

    // Initialize Supabase client if user is authenticated
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: authHeader },
        },
      });

      // Get user ID from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;

        // Fetch patient's medical history
        const { data: history } = await supabase
          .from('patient_medical_history')
          .select('*')
          .eq('patient_id', userId)
          .single();
        
        if (history) {
          medicalHistory = history;
        }

        // Fetch past symptom checks (last 5)
        const { data: pastChecks } = await supabase
          .from('symptom_checks')
          .select('symptoms, conditions_identified, severity_level, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (pastChecks) {
          pastSymptomChecks = pastChecks;
        }
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an AI medical assistant for ClinicianAI, a healthcare application. Your role is to analyze symptoms and provide preliminary guidance. 

IMPORTANT DISCLAIMERS:
- You are NOT a replacement for professional medical advice
- Always recommend consulting with healthcare professionals
- Flag emergency symptoms immediately
- Be conservative in assessments

${medicalHistory ? `
PATIENT MEDICAL HISTORY (Use this to provide more personalized analysis):
- Chronic Conditions: ${medicalHistory.chronic_conditions?.join(', ') || 'None reported'}
- Allergies: ${medicalHistory.allergies?.join(', ') || 'None reported'}
- Current Medications: ${medicalHistory.current_medications?.join(', ') || 'None reported'}
- Past Surgeries: ${medicalHistory.past_surgeries?.join(', ') || 'None reported'}
- Blood Type: ${medicalHistory.blood_type || 'Unknown'}
- Smoking Status: ${medicalHistory.smoking_status || 'Unknown'}
- BMI Category: ${medicalHistory.height_cm && medicalHistory.weight_kg ? 
    (medicalHistory.weight_kg / Math.pow(medicalHistory.height_cm / 100, 2)).toFixed(1) : 'Unknown'}

IMPORTANT: Consider the patient's medical history when analyzing symptoms. Be extra cautious with:
- Patients with chronic conditions that might be related to symptoms
- Potential drug interactions with current medications
- Allergies that might affect treatment recommendations
` : ''}

${pastSymptomChecks.length > 0 ? `
PAST SYMPTOM CHECKS (Recent history):
${pastSymptomChecks.map((check, i) => `
${i + 1}. ${new Date(check.created_at).toLocaleDateString()}:
   - Symptoms: ${check.symptoms}
   - Identified: ${check.conditions_identified?.join(', ') || 'N/A'}
   - Severity: ${check.severity_level}
`).join('')}

IMPORTANT: Consider patterns in the patient's symptom history. Look for:
- Recurring symptoms that might indicate chronic conditions
- Progressive worsening that requires immediate attention
- Related symptoms across multiple checks
` : ''}

MEDICAL KNOWLEDGE BASE:

COMMON CONDITIONS:
1. Respiratory:
   - Common Cold: runny nose, sore throat, mild cough, sneezing (3-7 days) - Mild
   - Flu: fever, body aches, fatigue, cough, chills (1-2 weeks) - Moderate
   - COVID-19: fever, dry cough, fatigue, loss of taste/smell (varies) - Moderate to Severe
   - Bronchitis: persistent cough, mucus, chest discomfort (2-3 weeks) - Moderate
   - Pneumonia: fever, difficulty breathing, chest pain, cough with phlegm - Severe

2. Gastrointestinal:
   - Food Poisoning: nausea, vomiting, diarrhea, cramps (1-3 days) - Mild to Moderate
   - Gastroenteritis: diarrhea, vomiting, stomach pain, fever (3-7 days) - Moderate
   - IBS: chronic abdominal pain, bloating, irregular bowel movements - Mild to Moderate
   - Appendicitis: severe abdominal pain (lower right), fever, nausea - EMERGENCY

3. Neurological:
   - Tension Headache: dull, aching head pain, tight feeling - Mild
   - Migraine: severe throbbing headache, nausea, light sensitivity (4-72 hours) - Moderate to Severe
   - Cluster Headache: severe pain around one eye, restlessness - Severe
   - Stroke symptoms: sudden numbness, confusion, trouble speaking, severe headache - EMERGENCY

4. Musculoskeletal:
   - Muscle Strain: localized pain, swelling, limited movement - Mild
   - Arthritis: joint pain, stiffness, swelling (chronic) - Mild to Moderate
   - Back Pain: lower back discomfort, stiffness (varies) - Mild to Moderate

5. Dermatological:
   - Allergic Reaction: rash, itching, hives, swelling - Mild to Severe
   - Eczema: itchy, inflamed skin, dry patches (chronic) - Mild to Moderate
   - Cellulitis: red, swollen, warm skin, fever - Moderate to Severe

6. General:
   - Allergies: sneezing, itchy eyes, runny nose, congestion - Mild
   - Dehydration: thirst, dizziness, dark urine, dry mouth - Mild to Moderate
   - Anemia: fatigue, weakness, pale skin, shortness of breath - Moderate

RED FLAG SYMPTOMS (IMMEDIATE CARE NEEDED):
- Chest pain or pressure
- Difficulty breathing or shortness of breath
- Severe headache with confusion or vision changes
- Persistent vomiting or diarrhea with signs of dehydration
- High fever (>103°F/39.4°C) that won't come down
- Severe abdominal pain
- Signs of stroke (FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency)
- Severe allergic reaction (difficulty breathing, swelling of face/throat)
- Loss of consciousness
- Severe bleeding that won't stop
- Sudden severe pain anywhere
- Suicidal thoughts or severe mental health crisis

SPECIALIST MAPPING:
- Respiratory issues → Pulmonologist or Internal Medicine
- Gastrointestinal → Gastroenterologist or Internal Medicine
- Neurological/Headaches → Neurologist
- Musculoskeletal → Orthopedist or Rheumatologist
- Skin conditions → Dermatologist
- Heart-related → Cardiologist
- Mental health → Psychiatrist or Psychologist
- General/Multiple systems → General Practitioner or Internal Medicine

AGE-SPECIFIC CONSIDERATIONS:
- Children (<18): More conservative recommendations, lower thresholds for seeking care
- Adults (18-65): Standard guidelines
- Seniors (>65): Extra caution, consider comorbidities, lower threshold for seeking care

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "conditions": [
    {
      "name": "Condition name",
      "likelihood": "High/Moderate/Low",
      "description": "Brief description of the condition"
    }
  ],
  "severity": "Mild/Moderate/Severe/Emergency",
  "isEmergency": true/false,
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ],
  "specialists": ["Specialist 1", "Specialist 2"],
  "whenToSeekCare": "Timeframe description",
  "disclaimer": "Always include a disclaimer about seeking professional medical advice"
}

Analyze the symptoms conservatively. If in doubt, recommend seeing a healthcare provider.`;

    const userPrompt = `Please analyze these symptoms:

Symptoms: ${symptoms}
Duration: ${duration || 'Not specified'}
Severity (patient-reported): ${severity || 'Not specified'}
Patient age range: ${age || 'Not specified'}

Provide your analysis in the specified JSON format.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again in a moment." 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Service temporarily unavailable. Please try again later." 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    console.log("AI response:", analysisText);

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                       analysisText.match(/```\n([\s\S]*?)\n```/) ||
                       [null, analysisText];
      analysis = JSON.parse(jsonMatch[1] || analysisText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback response if parsing fails
      analysis = {
        conditions: [{ 
          name: "Unable to analyze", 
          likelihood: "Unknown",
          description: "Please consult a healthcare provider for proper evaluation"
        }],
        severity: "Moderate",
        isEmergency: false,
        recommendations: [
          "Consult with a healthcare provider for accurate diagnosis",
          "Monitor your symptoms closely",
          "Seek immediate care if symptoms worsen"
        ],
        specialists: ["General Practitioner"],
        whenToSeekCare: "Within 24-48 hours",
        disclaimer: "This is not a medical diagnosis. Please consult with a qualified healthcare professional."
      };
    }

    // Save symptom check to database if user is authenticated
    if (userId && authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: authHeader },
        },
      });

      await supabase.from('symptom_checks').insert({
        user_id: userId,
        symptoms,
        duration,
        severity,
        age_range: age,
        ai_analysis: analysis,
        conditions_identified: analysis.conditions.map((c: any) => c.name),
        severity_level: analysis.severity,
        is_emergency: analysis.isEmergency
      });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in symptom-checker function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An error occurred during analysis' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
