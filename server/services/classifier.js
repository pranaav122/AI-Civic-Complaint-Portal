export const classifyComplaintFallback = (description) => {
  const descLower = description.toLowerCase();
  
  // Keyword mapping
  const categoryMap = [
    { keywords: ['road', 'pothole', 'crack', 'highway', 'bridge', 'footpath', 'சாலை', 'குழி'], category: 'Roads', subcategory: 'Infrastructure', code: 'roads' },
    { keywords: ['garbage', 'waste', 'trash', 'dump', 'bin', 'sanitation', 'dustbin', 'குப்பை', 'கழிவு'], category: 'Sanitation', subcategory: 'Waste Management', code: 'sanitation' },
    { keywords: ['water', 'pipe', 'leak', 'supply', 'tap', 'bore', 'நீர்', 'குடிநீர்', 'கசிவு'], category: 'Water Supply', subcategory: 'Infrastructure', code: 'water' },
    { keywords: ['drain', 'sewer', 'flood', 'waterlog', 'blockage', 'வடிகால்', 'கழிவுநீர்', 'அடைப்பு'], category: 'Drainage', subcategory: 'Sewerage', code: 'drainage' },
    { keywords: ['light', 'lamp', 'streetlight', 'dark', 'electric', 'pole', 'விளக்கு', 'மின்சாரம்'], category: 'Electrical', subcategory: 'Streetlights', code: 'electrical' },
    { keywords: ['bus', 'transport', 'auto', 'traffic', 'signal', 'போக்குவரத்து', 'பேருந்து'], category: 'Transport', subcategory: 'Public Transport', code: 'transport' }
  ];

  let matchedCategory = { category: 'General Administration', subcategory: 'General', code: 'general' };
  
  for (const map of categoryMap) {
    if (map.keywords.some(kw => descLower.includes(kw))) {
      matchedCategory = map;
      break;
    }
  }

  // Priority based on urgency keywords
  const criticalKeywords = ['danger', 'accident', 'fell', 'collapse', 'emergency', 'flood', 'விபத்து', 'அபாயம்'];
  const highKeywords = ['urgent', 'broken', 'leak', 'overflow', 'அவசரம்', 'உடைந்த'];
  
  let severity = 'medium';
  let priority = 'medium';
  let explanation = 'Based on general keyword matching.';

  if (criticalKeywords.some(kw => descLower.includes(kw))) {
    severity = 'critical';
    priority = 'critical';
    explanation = 'Critical keywords detected indicating potential danger.';
  } else if (highKeywords.some(kw => descLower.includes(kw))) {
    severity = 'high';
    priority = 'high';
    explanation = 'Urgency keywords detected.';
  }

  return {
    category: matchedCategory.category,
    subcategory: matchedCategory.subcategory,
    severity,
    priority,
    department_code: matchedCategory.code,
    location_extracted: null,
    explanation,
    language_detected: descLower.match(/[அ-ஹ]/) ? 'ta' : 'en'
  };
};

export const matchSchemesFallback = (profile, schemes) => {
  return schemes.map(scheme => {
    let score = 0;
    let reasons = [];
    
    if (profile.student && scheme.for_students) {
      score += 50;
      reasons.push('Matches student criteria.');
    }
    
    if (profile.disabled && scheme.for_disabled) {
      score += 50;
      reasons.push('Matches disability criteria.');
    }
    
    // Default match score for demo purposes
    if (score === 0) {
      score = 20;
      reasons.push('General eligibility criteria might apply.');
    }

    return {
      scheme_id: scheme.id,
      match_score: score,
      explanation: reasons.join(' '),
      why_eligible: reasons
    };
  }).sort((a, b) => b.match_score - a.match_score).slice(0, 5);
};

export const analyzeImageFallback = (imagePath) => {
  return {
    severity: 'medium',
    description: 'Image analysis fallback.',
    details: 'Visual details not extracted (API key missing).'
  };
};
