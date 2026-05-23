import re
from typing import Dict, Any, List

# Local corpus of PM-JAY and ESIC guidelines
KNOWLEDGE_BASE = [
    {
        "id": "pmjay_general",
        "title": "Ayushman Bharat PM-JAY Overview",
        "content": "Ayushman Bharat PM-JAY offers cashless coverage of up to ₹5,000,000 (5 Lakhs) per family per year for secondary and tertiary care hospitalization. The scheme has no cap on family size or age. It is completely cashless and paperless at all empanelled public and private hospitals.",
        "keywords": ["pmjay", "ayushman", "bharat", "limit", "coverage", "how much", "cashless"]
    },
    {
        "id": "pmjay_eligibility",
        "title": "PM-JAY Eligibility Criteria",
        "content": "PM-JAY is entitlement-based, targeting households classified as poor or vulnerable in the Socio-Economic Caste Census (SECC) 2011 database. Key groups include families living in single-room houses with kucha walls, landless households, manual scavenger families, and rural families with no adult member aged 16-59.",
        "keywords": ["eligible", "income", "criteria", "who", "target", "secc", "qualification"]
    },
    {
        "id": "pmjay_procedures",
        "title": "PM-JAY Cover and Exclusions",
        "content": "PM-JAY covers over 1,393 medical procedures including cardiology, oncology, neurosurgery, orthopedics (fracture surgeries), and pediatric treatments. Routine OPD (outpatient) treatments and cosmetic surgeries are generally excluded. Room rent and nursing charges are covered within the packages.",
        "keywords": ["procedure", "surgery", "room rent", "opd", "exclusion", "cardiology", "ortho"]
    },
    {
        "id": "esic_general",
        "title": "ESIC Medical Benefits Overview",
        "content": "The Employees' State Insurance Scheme (ESIC) provides full medical care to employees in the organized sector earning up to ₹21,000 per month. The medical benefits are self-funded through monthly employer (3.25%) and employee (0.75%) contributions. Medical treatment is provided in ESIC-run hospitals and dispensaries, as well as tie-up private facilities.",
        "keywords": ["esic", "employee", "wage", "contribution", "hospitals", "dispensary"]
    },
    {
        "id": "esic_benefits",
        "title": "ESIC Treatment coverage and limits",
        "content": "ESIC provides comprehensive outpatient and inpatient medical care without any upper ceiling on expenditure for the insured person and their family members. Covered benefits include drugs, specialty consultations, diagnostic tests, surgeries, and maternity benefits.",
        "keywords": ["limit", "ceiling", "family", "maternity", "drug", "test"]
    },
    {
        "id": "claim_process",
        "title": "How to claim under PM-JAY and ESIC",
        "content": "For PM-JAY, show your Ayushman card at the hospital's 'Ayushman Mitra' desk to initiate cashless treatment. For ESIC, visit the local ESIC dispensary or tie-up hospital with your Pehchan card. Emergency cases do not require prior referral if admitted to an empanelled hospital.",
        "keywords": ["claim", "mitra", "pehchan", "apply", "bill", "admission", "process"]
    }
]

def query_rag_bot(query: str, language: str = "en") -> Dict[str, Any]:
    query_lower = query.lower()
    query_tokens = re.findall(r'\w+', query_lower)
    
    # Calculate scores for each knowledge document
    best_doc = None
    max_score = 0
    
    for doc in KNOWLEDGE_BASE:
        score = 0
        for token in query_tokens:
            if token in doc["keywords"]:
                score += 3
            if token in doc["content"].lower():
                score += 1
        
        if score > max_score:
            max_score = score
            best_doc = doc
            
    # Default fallback answer
    if not best_doc or max_score < 2:
        if language == "hi":
            return {
                "response": "क्षमा करें, मुझे आपकी पूछताछ से संबंधित विशिष्ट पॉलिसी दस्तावेज नहीं मिले। दावा प्रक्रिया के तहत, PM-JAY 5 लाख रुपये तक का कैशलेस कवर प्रदान करता है, और ESIC संगठित क्षेत्र के कर्मचारियों (₹21,000 तक वेतन) को चिकित्सा लाभ देता है। कृपया अस्पताल के बीमा डेस्क से संपर्क करें।",
                "sources": ["सामान्य योजना नियम"]
            }
        return {
            "response": "I'm sorry, I couldn't find a specific policy document matching your query. General Guidelines: PM-JAY covers up to ₹5 Lakhs cashless treatment for eligible families. ESIC covers employees earning up to ₹21,000/month. Please contact the hospital's TPA/insurance desk for assistance.",
            "sources": ["General Scheme Guidelines"]
        }

    # Generate response
    response_text = best_doc["content"]
    title = best_doc["title"]
    
    # Translate query results to Hindi if requested (using a rule-based dictionary for a realistic interface experience)
    if language == "hi":
        hindi_translations = {
            "pmjay_general": "आयुष्मान भारत PM-JAY योजना माध्यमिक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष ₹5,00,000 (5 लाख) तक का कैशलेस कवरेज प्रदान करती है। इस योजना में परिवार के आकार या आयु की कोई सीमा नहीं है। यह सरकारी और निजी दोनों अस्पतालों में कैशलेस है।",
            "pmjay_eligibility": "PM-JAY पात्रता सामाजिक-आर्थिक जाति जनगणना (SECC) 2011 डेटाबेस पर आधारित है। ग्रामीण क्षेत्रों में कच्चे मकान वाले परिवार, भूमिहीन परिवार, और ऐसे परिवार जिनमें 16-59 वर्ष की आयु का कोई वयस्क सदस्य नहीं है, इसके पात्र हैं।",
            "pmjay_procedures": "PM-JAY कार्डियोलॉजी, ऑन्कोलॉजी, न्यूरोसर्जरी, ऑर्थोपेडिक्स (फ्रैक्चर) सहित 1,393 से अधिक चिकित्सा प्रक्रियाओं को कवर करता है। सामान्य ओपीडी उपचार और कॉस्मेटिक सर्जरी इसमें शामिल नहीं हैं।",
            "esic_general": "कर्मचारी राज्य बीमा योजना (ESIC) संगठित क्षेत्र के कर्मचारियों को पूर्ण चिकित्सा देखभाल प्रदान करती है जिनका मासिक वेतन ₹21,000 तक है। चिकित्सा लाभ ESIC अस्पतालों और डिस्पेन्सरी में दिए जाते हैं।",
            "esic_benefits": "ESIC बीमित व्यक्ति और उसके आश्रितों के लिए बिना किसी सीमा के ओपीडी और इनपेशेंट उपचार कवर प्रदान करता है। इसमें दवाएं, जांच और मैटरनिटी लाभ शामिल हैं।",
            "claim_process": "PM-JAY के तहत दावा करने के लिए अस्पताल के 'आयुष्मान मित्र' डेस्क पर अपना आयुष्मान कार्ड दिखाएं। ESIC के लिए, अपनी पहचान आईडी के साथ स्थानीय ईएसआईसी अस्पताल या डिस्पेंसरी पर जाएं।"
        }
        response_text = hindi_translations.get(best_doc["id"], response_text)
        
    return {
        "response": response_text,
        "sources": [title]
    }
