/**
 * Sri Lankan Rural Citizen Services & Welfare Navigator Directory
 * Tailored for Ampitiya, Kandy District, Central Province
 */

export interface CitizenServiceGuide {
  id: string;
  titleEn: string;
  titleSi: string;
  category: 'Welfare' | 'Legal' | 'Agriculture' | 'Civil' | 'Health';
  authorityEn: string;
  authoritySi: string;
  descriptionEn: string;
  descriptionSi: string;
  eligibilityEn: string[];
  eligibilitySi: string[];
  requiredDocsEn: string[];
  requiredDocsSi: string[];
  processingTime: string;
  kandyContact: string;
}

export const CITIZEN_SERVICES: CitizenServiceGuide[] = [
  {
    id: 'srv-01',
    titleEn: 'Aswesuma Welfare Appeals & New Application Guide',
    titleSi: 'අස්වැසුම සුභසාධන අභියාචනා සහ නව ලියාපදිංචි මඟපෙන්වීම',
    category: 'Welfare',
    authorityEn: 'Welfare Benefits Board (WBB) / Divisional Secretariat',
    authoritySi: 'සුභසාධක ප්‍රතිලාභ මණ්ඩලය / ප්‍රාදේශීය ලේකම් කාර්යාලය',
    descriptionEn: 'Official guidance for households whose Aswesuma welfare tier was downgraded, rejected, or who need to file an appeal.',
    descriptionSi: 'අස්වැසුම කාණ්ඩය සංශෝධනය කරගැනීමට හෝ ප්‍රතික්ෂේප වූවන් සඳහා නිල අභියාචනා ඉදිරිපත් කිරීමේ ක්‍රියාවලිය.',
    eligibilityEn: [
      'Low income or daily wage earning households',
      'Families with elderly, chronic illness, or school-going children',
      'Residents of Ampitiya or adjoining GN divisions',
    ],
    eligibilitySi: [
      'අඩු ආදායම්ලාභී හෝ දෛනික වැටුප් ලබන පවුල්',
      'වැඩිහිටියන්, දීර්ඝකාලීන රෝගීන් හෝ පාසල් දරුවන් සිටින පවුල්',
      'අම්පිටිය හෝ අවට ග්‍රාම නිලධාරී වසම්වල ස්ථිර පදිංචිකරුවන්',
    ],
    requiredDocsEn: [
      'National Identity Card (NIC) photocopies of all adult family members',
      'Electricity / Water bill of the residence',
      'Electoral register extract from Grama Niladhari',
      'Medical certificates for chronic illness / disability (if applicable)',
      'Previous Samurdhi / Aswesuma household reference code',
    ],
    requiredDocsSi: [
      'පවුලේ සියලුම වැඩිහිටි සාමාජිකයින්ගේ ජාතික හැඳුනුම්පත් ඡායාපිටපත්',
      'නිවසේ විදුලි හෝ ජල බිල්පතක්',
      'ග්‍රාම නිලධාරී විසින් සහතික කළ ඡන්ද හිමි නාමලේඛන උපුටා ගැනීම',
      'දීර්ඝකාලීන රෝගී තත්ත්ව හෝ ආබාධිත බව තහවුරු කරන වෛද්‍ය වාර්තා',
      'පෙර පැවති සමෘද්ධි හෝ අස්වැසුම යොමු අංකය',
    ],
    processingTime: '14 - 30 Days (DS Committee Review)',
    kandyContact: 'Kandy Divisional Secretariat: 081-2222234',
  },
  {
    id: 'srv-02',
    titleEn: 'Grama Niladhari Residence & Character Certificate',
    titleSi: 'ග්‍රාම නිලධාරී පදිංචිය සහ චරිත සහතිකය ලබාගැනීම',
    category: 'Civil',
    authorityEn: 'Grama Niladhari Division (Ampitiya Cluster)',
    authoritySi: 'අදාළ ග්‍රාම නිලධාරී වසම (අම්පිටිය කලාපය)',
    descriptionEn: 'Required for school admissions, police clearances, job applications, and non-government grants.',
    descriptionSi: 'පාසල් ඇතුළත් කිරීම්, රැකියා අයදුම්පත් සහ විවිධ රාජ්‍ය සහන ලබාගැනීම සඳහා අවශ්‍ය වන මූලික සහතිකය.',
    eligibilityEn: [
      'Minimum 6 months continuous residence in the specific GN division',
      'Included in the current year electoral register',
    ],
    eligibilitySi: [
      'අදාළ වසම තුළ අවම වශයෙන් මාස 6ක අඛණ්ඩ පදිංචිය',
      'වත්මන් වසරේ ඡන්ද හිමි නාමලේඛනයේ නම ඇතුළත්ව තිබීම',
    ],
    requiredDocsEn: [
      'Original NIC and photocopy',
      'Birth Certificate copy',
      'Deed or rent agreement of the residence',
      'Previous residence clearance if newly relocated',
    ],
    requiredDocsSi: [
      'මුල් ජාතික හැඳුනුම්පත සහ ඡායාපිටපත',
      'උප්පැන්න සහතිකයේ පිටපතක්',
      'නිවසේ ඔප්පුව හෝ කුලී ගිවිසුම',
      'පෙර පදිංචි වසමෙන් ලබාගත් නිදහස් කිරීමේ ලිපිය (අලුතින් පදිංචි වූවන් සඳහා)',
    ],
    processingTime: '1 - 3 Days',
    kandyContact: 'Ampitiya GN Office / DS Office',
  },
  {
    id: 'srv-03',
    titleEn: 'Free Legal Aid & Land Boundary Dispute Mediation',
    titleSi: 'නොමිලේ නීති ආධාර සහ ඉඩම් මායිම් ආරවුල් සමථකරණය',
    category: 'Legal',
    authorityEn: 'Legal Aid Commission of Sri Lanka (Kandy Center)',
    authoritySi: 'ශ්‍රී ලංකා නීති ආධාර කොමිෂන් සභාව (මහනුවර මධ්‍යස්ථානය)',
    descriptionEn: 'Free legal advice and court representation for low-income villagers facing land disputes or family issues.',
    descriptionSi: 'ඉඩම් මායිම් ආරවුල්, නඩත්තු නඩු සහ පවුල් ආරවුල් සඳහා අඩු ආදායම්ලාභී ප්‍රජාවට ලබාදෙන නොමිලේ නීති සහාය.',
    eligibilityEn: [
      'Monthly household income below Rs. 35,000',
      'Disputes relating to land boundaries, maintenance, or civil matters',
    ],
    eligibilitySi: [
      'මාසික පවුලේ ආදායම රු. 35,000ට අඩු වීම',
      'ඉඩම් මායිම්, පවුල් නඩත්තු හෝ සිවිල් ගැටලු සහිත වීම',
    ],
    requiredDocsEn: [
      'Land title deed or partition plan (if land dispute)',
      'Income certification from Grama Niladhari',
      'Copies of any court summons or police complaints',
    ],
    requiredDocsSi: [
      'ඉඩමේ ඔප්පුව හෝ මිනින්දෝරු පිඹුර (ඉඩම් ගැටලුවක් නම්)',
      'ග්‍රාම නිලධාරී විසින් ලබාදුන් ආදායම් සහතිකය',
      'පොලිස් පැමිණිලි හෝ උසාවි නොතීසි පිටපත්',
    ],
    processingTime: 'Same Day Consultation / Ongoing Court Dates',
    kandyContact: 'Legal Aid Commission Kandy: 081-2234589',
  },
  {
    id: 'srv-04',
    titleEn: 'Smallholder Agriculture & Organic Fertilizer Subsidies',
    titleSi: 'සුළු පරිමාණ ගොවි සහනාධාර සහ කාබනික පොහොර ආධාර',
    category: 'Agriculture',
    authorityEn: 'Agrarian Services Department (Kundasale / Kandy Center)',
    authoritySi: 'ගොවිජන සේවා දෙපාර්තමේන්තුව (මහනුවර)',
    descriptionEn: 'Support for home-gardeners, pepper/spice growers, and small paddy farmers in Ampitiya hills.',
    descriptionSi: 'අම්පිටිය අවට කුළුබඩු, එළවළු සහ ගෙවතු වගාකරුවන් සඳහා නොමිලේ හෝ සහන මිලට බීජ සහ පොහොර ලබාගැනීම.',
    eligibilityEn: [
      'Cultivating land between 0.25 to 2 acres',
      'Registered with local Agrarian Services Center (Govi Niyamaka)',
    ],
    eligibilitySi: [
      'අක්කර 0.25 සිට 2 දක්වා වගා කරන ගොවීන්',
      'ප්‍රාදේශීය ගොවිජන සේවා මධ්‍යස්ථානයේ ලියාපදිංචි වී තිබීම',
    ],
    requiredDocsEn: [
      'Farmer Identity Card (Govi Sahathikaya)',
      'Land ownership proof or tenant agreement',
      'Bank passbook photocopy for direct subsidy credit',
    ],
    requiredDocsSi: [
      'ගොවි හැඳුනුම්පත',
      'ඉඩම් හිමිකම් ලේඛන හෝ අඳ ගොවි ගිවිසුම',
      'සහනාධාර මුදල් බැර කිරීමට බැංකු පොතේ පිටපතක්',
    ],
    processingTime: '7 - 14 Days (Seasonally)',
    kandyContact: 'Agrarian Services Kandy: 081-2223344',
  },
  {
    id: 'srv-05',
    titleEn: 'Senior Citizen & Disability Assistive Equipment Grants',
    titleSi: 'වැඩිහිටි හා ආබාධිත උපකරණ සහ විශේෂ දීමනා අයදුම්පත',
    category: 'Health',
    authorityEn: 'National Secretariat for Persons with Disabilities / DS Office',
    authoritySi: 'ආබාධිත තැනැත්තන් සඳහා වූ ජාතික ලේකම් කාර්යාලය',
    descriptionEn: 'Free wheelchairs, crutches, hearing aids, spectacles, and monthly welfare allowances for vulnerable elders.',
    descriptionSi: 'රෝද පුටු, අත්වාරු, ශ්‍රවණාධාරක, ඇස් කණ්ණාඩි සහ මාසික වැඩිහිටි දීමනාව ලබාගැනීම.',
    eligibilityEn: [
      'Citizens aged 70+ (Elderly allowance) or certified disability at any age',
      'Resident of Central Province',
    ],
    eligibilitySi: [
      'වයස අවුරුදු 70ට වැඩි ජ්‍යෙෂ්ඨ පුරවැසියන් හෝ ආබාධිත පුද්ගලයින්',
      'මධ්‍යම පළාතේ ස්ථිර පදිංචිකරුවන්',
    ],
    requiredDocsEn: [
      'National Identity Card of applicant',
      'Government Hospital medical specialist evaluation report',
      'Two passport size photographs',
      'Income certificate from Grama Niladhari',
    ],
    requiredDocsSi: [
      'අයදුම්කරුගේ ජාතික හැඳුනුම්පත',
      'රජයේ රෝහල් විශේෂඥ වෛද්‍ය වාර්තාව',
      'පාස්පෝට් ප්‍රමාණයේ ඡායාරූප 2ක්',
      'ග්‍රාම නිලධාරී ආදායම් සහතිකය',
    ],
    processingTime: '21 - 45 Days',
    kandyContact: 'Social Services Officer Kandy: 081-2232323',
  },
];
