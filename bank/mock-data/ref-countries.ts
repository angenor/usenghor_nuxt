// ============================================================================
// MOCK DATA - PAYS (COUNTRIES)
// ============================================================================
// Basé sur le schéma SQL: 01_core.sql
// Table: countries
// ============================================================================

// Interface Country basée sur le schéma SQL
export interface Country {
  id: string
  iso_code: string      // Code ISO 2 (ex: "SN")
  iso_code3: string | null  // Code ISO 3 (ex: "SEN")
  name_fr: string       // Nom français
  name_en: string | null    // Nom anglais
  name_ar: string | null    // Nom arabe
  phone_code: string | null // Indicatif téléphonique (ex: "+221")
  active: boolean
  created_at: string
  updated_at: string
}

// Filtres pour la liste des pays
export interface CountryFilters {
  search?: string
  active?: boolean
  sort_by?: 'name_fr' | 'iso_code' | 'updated_at'
  sort_order?: 'asc' | 'desc'
}

// Statistiques des pays
export interface CountryStats {
  total: number
  active: number
  inactive: number
  with_phone_code: number
  with_arabic_name: number
}

// ============================================================================
// DONNÉES MOCK - PAYS AFRICAINS + AUTRES IMPORTANTS
// ============================================================================

export const mockCountriesRef: Country[] = [
  // Pays africains francophones (prioritaires)
  {
    id: 'country_001',
    iso_code: 'SN',
    iso_code3: 'SEN',
    name_fr: 'Sénégal',
    name_en: 'Senegal',
    name_ar: 'السنغال',
    phone_code: '+221',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_002',
    iso_code: 'EG',
    iso_code3: 'EGY',
    name_fr: 'Égypte',
    name_en: 'Egypt',
    name_ar: 'مصر',
    phone_code: '+20',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_003',
    iso_code: 'CI',
    iso_code3: 'CIV',
    name_fr: 'Côte d\'Ivoire',
    name_en: 'Ivory Coast',
    name_ar: 'ساحل العاج',
    phone_code: '+225',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_004',
    iso_code: 'CM',
    iso_code3: 'CMR',
    name_fr: 'Cameroun',
    name_en: 'Cameroon',
    name_ar: 'الكاميرون',
    phone_code: '+237',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_005',
    iso_code: 'MA',
    iso_code3: 'MAR',
    name_fr: 'Maroc',
    name_en: 'Morocco',
    name_ar: 'المغرب',
    phone_code: '+212',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_006',
    iso_code: 'TN',
    iso_code3: 'TUN',
    name_fr: 'Tunisie',
    name_en: 'Tunisia',
    name_ar: 'تونس',
    phone_code: '+216',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_007',
    iso_code: 'DZ',
    iso_code3: 'DZA',
    name_fr: 'Algérie',
    name_en: 'Algeria',
    name_ar: 'الجزائر',
    phone_code: '+213',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_008',
    iso_code: 'ML',
    iso_code3: 'MLI',
    name_fr: 'Mali',
    name_en: 'Mali',
    name_ar: 'مالي',
    phone_code: '+223',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_009',
    iso_code: 'BF',
    iso_code3: 'BFA',
    name_fr: 'Burkina Faso',
    name_en: 'Burkina Faso',
    name_ar: 'بوركينا فاسو',
    phone_code: '+226',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_010',
    iso_code: 'NE',
    iso_code3: 'NER',
    name_fr: 'Niger',
    name_en: 'Niger',
    name_ar: 'النيجر',
    phone_code: '+227',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_011',
    iso_code: 'TD',
    iso_code3: 'TCD',
    name_fr: 'Tchad',
    name_en: 'Chad',
    name_ar: 'تشاد',
    phone_code: '+235',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_012',
    iso_code: 'BJ',
    iso_code3: 'BEN',
    name_fr: 'Bénin',
    name_en: 'Benin',
    name_ar: 'بنين',
    phone_code: '+229',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_013',
    iso_code: 'TG',
    iso_code3: 'TGO',
    name_fr: 'Togo',
    name_en: 'Togo',
    name_ar: 'توغو',
    phone_code: '+228',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_014',
    iso_code: 'GN',
    iso_code3: 'GIN',
    name_fr: 'Guinée',
    name_en: 'Guinea',
    name_ar: 'غينيا',
    phone_code: '+224',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_015',
    iso_code: 'MR',
    iso_code3: 'MRT',
    name_fr: 'Mauritanie',
    name_en: 'Mauritania',
    name_ar: 'موريتانيا',
    phone_code: '+222',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_016',
    iso_code: 'GA',
    iso_code3: 'GAB',
    name_fr: 'Gabon',
    name_en: 'Gabon',
    name_ar: 'الغابون',
    phone_code: '+241',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_017',
    iso_code: 'CG',
    iso_code3: 'COG',
    name_fr: 'Congo',
    name_en: 'Congo',
    name_ar: 'الكونغو',
    phone_code: '+242',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_018',
    iso_code: 'CD',
    iso_code3: 'COD',
    name_fr: 'République démocratique du Congo',
    name_en: 'Democratic Republic of the Congo',
    name_ar: 'جمهورية الكونغو الديمقراطية',
    phone_code: '+243',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_019',
    iso_code: 'CF',
    iso_code3: 'CAF',
    name_fr: 'République centrafricaine',
    name_en: 'Central African Republic',
    name_ar: 'جمهورية أفريقيا الوسطى',
    phone_code: '+236',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_020',
    iso_code: 'MG',
    iso_code3: 'MDG',
    name_fr: 'Madagascar',
    name_en: 'Madagascar',
    name_ar: 'مدغشقر',
    phone_code: '+261',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_021',
    iso_code: 'RW',
    iso_code3: 'RWA',
    name_fr: 'Rwanda',
    name_en: 'Rwanda',
    name_ar: 'رواندا',
    phone_code: '+250',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_022',
    iso_code: 'BI',
    iso_code3: 'BDI',
    name_fr: 'Burundi',
    name_en: 'Burundi',
    name_ar: 'بوروندي',
    phone_code: '+257',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_023',
    iso_code: 'KM',
    iso_code3: 'COM',
    name_fr: 'Comores',
    name_en: 'Comoros',
    name_ar: 'جزر القمر',
    phone_code: '+269',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_024',
    iso_code: 'DJ',
    iso_code3: 'DJI',
    name_fr: 'Djibouti',
    name_en: 'Djibouti',
    name_ar: 'جيبوتي',
    phone_code: '+253',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_025',
    iso_code: 'MU',
    iso_code3: 'MUS',
    name_fr: 'Maurice',
    name_en: 'Mauritius',
    name_ar: 'موريشيوس',
    phone_code: '+230',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_026',
    iso_code: 'SC',
    iso_code3: 'SYC',
    name_fr: 'Seychelles',
    name_en: 'Seychelles',
    name_ar: 'سيشيل',
    phone_code: '+248',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Autres pays africains
  {
    id: 'country_027',
    iso_code: 'NG',
    iso_code3: 'NGA',
    name_fr: 'Nigeria',
    name_en: 'Nigeria',
    name_ar: 'نيجيريا',
    phone_code: '+234',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_028',
    iso_code: 'GH',
    iso_code3: 'GHA',
    name_fr: 'Ghana',
    name_en: 'Ghana',
    name_ar: 'غانا',
    phone_code: '+233',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_029',
    iso_code: 'KE',
    iso_code3: 'KEN',
    name_fr: 'Kenya',
    name_en: 'Kenya',
    name_ar: 'كينيا',
    phone_code: '+254',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_030',
    iso_code: 'TZ',
    iso_code3: 'TZA',
    name_fr: 'Tanzanie',
    name_en: 'Tanzania',
    name_ar: 'تنزانيا',
    phone_code: '+255',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_031',
    iso_code: 'UG',
    iso_code3: 'UGA',
    name_fr: 'Ouganda',
    name_en: 'Uganda',
    name_ar: 'أوغندا',
    phone_code: '+256',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_032',
    iso_code: 'ET',
    iso_code3: 'ETH',
    name_fr: 'Éthiopie',
    name_en: 'Ethiopia',
    name_ar: 'إثيوبيا',
    phone_code: '+251',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_033',
    iso_code: 'ZA',
    iso_code3: 'ZAF',
    name_fr: 'Afrique du Sud',
    name_en: 'South Africa',
    name_ar: 'جنوب أفريقيا',
    phone_code: '+27',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_034',
    iso_code: 'AO',
    iso_code3: 'AGO',
    name_fr: 'Angola',
    name_en: 'Angola',
    name_ar: 'أنغولا',
    phone_code: '+244',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_035',
    iso_code: 'MZ',
    iso_code3: 'MOZ',
    name_fr: 'Mozambique',
    name_en: 'Mozambique',
    name_ar: 'موزمبيق',
    phone_code: '+258',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_036',
    iso_code: 'ZM',
    iso_code3: 'ZMB',
    name_fr: 'Zambie',
    name_en: 'Zambia',
    name_ar: 'زامبيا',
    phone_code: '+260',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_037',
    iso_code: 'ZW',
    iso_code3: 'ZWE',
    name_fr: 'Zimbabwe',
    name_en: 'Zimbabwe',
    name_ar: 'زيمبابوي',
    phone_code: '+263',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_038',
    iso_code: 'BW',
    iso_code3: 'BWA',
    name_fr: 'Botswana',
    name_en: 'Botswana',
    name_ar: 'بوتسوانا',
    phone_code: '+267',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_039',
    iso_code: 'NA',
    iso_code3: 'NAM',
    name_fr: 'Namibie',
    name_en: 'Namibia',
    name_ar: 'ناميبيا',
    phone_code: '+264',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_040',
    iso_code: 'LS',
    iso_code3: 'LSO',
    name_fr: 'Lesotho',
    name_en: 'Lesotho',
    name_ar: 'ليسوتو',
    phone_code: '+266',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_041',
    iso_code: 'SZ',
    iso_code3: 'SWZ',
    name_fr: 'Eswatini',
    name_en: 'Eswatini',
    name_ar: 'إسواتيني',
    phone_code: '+268',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_042',
    iso_code: 'MW',
    iso_code3: 'MWI',
    name_fr: 'Malawi',
    name_en: 'Malawi',
    name_ar: 'مالاوي',
    phone_code: '+265',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_043',
    iso_code: 'LR',
    iso_code3: 'LBR',
    name_fr: 'Liberia',
    name_en: 'Liberia',
    name_ar: 'ليبيريا',
    phone_code: '+231',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_044',
    iso_code: 'SL',
    iso_code3: 'SLE',
    name_fr: 'Sierra Leone',
    name_en: 'Sierra Leone',
    name_ar: 'سيراليون',
    phone_code: '+232',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_045',
    iso_code: 'GW',
    iso_code3: 'GNB',
    name_fr: 'Guinée-Bissau',
    name_en: 'Guinea-Bissau',
    name_ar: 'غينيا بيساو',
    phone_code: '+245',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_046',
    iso_code: 'GM',
    iso_code3: 'GMB',
    name_fr: 'Gambie',
    name_en: 'Gambia',
    name_ar: 'غامبيا',
    phone_code: '+220',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_047',
    iso_code: 'CV',
    iso_code3: 'CPV',
    name_fr: 'Cap-Vert',
    name_en: 'Cape Verde',
    name_ar: 'الرأس الأخضر',
    phone_code: '+238',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_048',
    iso_code: 'ST',
    iso_code3: 'STP',
    name_fr: 'Sao Tomé-et-Príncipe',
    name_en: 'Sao Tome and Principe',
    name_ar: 'ساو تومي وبرينسيب',
    phone_code: '+239',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_049',
    iso_code: 'GQ',
    iso_code3: 'GNQ',
    name_fr: 'Guinée équatoriale',
    name_en: 'Equatorial Guinea',
    name_ar: 'غينيا الاستوائية',
    phone_code: '+240',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_050',
    iso_code: 'LY',
    iso_code3: 'LBY',
    name_fr: 'Libye',
    name_en: 'Libya',
    name_ar: 'ليبيا',
    phone_code: '+218',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_051',
    iso_code: 'SD',
    iso_code3: 'SDN',
    name_fr: 'Soudan',
    name_en: 'Sudan',
    name_ar: 'السودان',
    phone_code: '+249',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_052',
    iso_code: 'SS',
    iso_code3: 'SSD',
    name_fr: 'Soudan du Sud',
    name_en: 'South Sudan',
    name_ar: 'جنوب السودان',
    phone_code: '+211',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_053',
    iso_code: 'ER',
    iso_code3: 'ERI',
    name_fr: 'Érythrée',
    name_en: 'Eritrea',
    name_ar: 'إريتريا',
    phone_code: '+291',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_054',
    iso_code: 'SO',
    iso_code3: 'SOM',
    name_fr: 'Somalie',
    name_en: 'Somalia',
    name_ar: 'الصومال',
    phone_code: '+252',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Pays européens importants (partenaires)
  {
    id: 'country_055',
    iso_code: 'FR',
    iso_code3: 'FRA',
    name_fr: 'France',
    name_en: 'France',
    name_ar: 'فرنسا',
    phone_code: '+33',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_056',
    iso_code: 'BE',
    iso_code3: 'BEL',
    name_fr: 'Belgique',
    name_en: 'Belgium',
    name_ar: 'بلجيكا',
    phone_code: '+32',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_057',
    iso_code: 'CH',
    iso_code3: 'CHE',
    name_fr: 'Suisse',
    name_en: 'Switzerland',
    name_ar: 'سويسرا',
    phone_code: '+41',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country_058',
    iso_code: 'CA',
    iso_code3: 'CAN',
    name_fr: 'Canada',
    name_en: 'Canada',
    name_ar: 'كندا',
    phone_code: '+1',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Pays inactifs (exemples)
  {
    id: 'country_059',
    iso_code: 'XX',
    iso_code3: 'XXX',
    name_fr: 'Pays test',
    name_en: 'Test country',
    name_ar: null,
    phone_code: null,
    active: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Générer un ID unique
export const generateCountryId = (): string => {
  return `country_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Récupérer tous les pays avec filtres
export const getAllCountriesRef = (filters?: CountryFilters): Country[] => {
  let result = [...mockCountriesRef]

  if (filters) {
    // Filtre par recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(c =>
        c.name_fr.toLowerCase().includes(search) ||
        (c.name_en?.toLowerCase().includes(search) ?? false) ||
        (c.name_ar?.toLowerCase().includes(search) ?? false) ||
        c.iso_code.toLowerCase().includes(search) ||
        (c.iso_code3?.toLowerCase().includes(search) ?? false)
      )
    }

    // Filtre par statut actif
    if (filters.active !== undefined) {
      result = result.filter(c => c.active === filters.active)
    }

    // Tri
    const sortBy = filters.sort_by || 'name_fr'
    const sortOrder = filters.sort_order || 'asc'
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'iso_code':
          comparison = a.iso_code.localeCompare(b.iso_code)
          break
        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
        case 'name_fr':
        default:
          comparison = a.name_fr.localeCompare(b.name_fr, 'fr')
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })
  } else {
    // Tri par défaut : nom français alphabétique
    result.sort((a, b) => a.name_fr.localeCompare(b.name_fr, 'fr'))
  }

  return result
}

// Récupérer les pays actifs uniquement
export const getActiveCountriesRef = (): Country[] => {
  return getAllCountriesRef({ active: true })
}

// Récupérer un pays par ID
export const getCountryByIdRef = (id: string): Country | undefined => {
  return mockCountriesRef.find(c => c.id === id)
}

// Récupérer un pays par code ISO
export const getCountryByIsoCodeRef = (isoCode: string): Country | undefined => {
  return mockCountriesRef.find(c => c.iso_code.toLowerCase() === isoCode.toLowerCase())
}

// Vérifier si un code ISO est déjà utilisé
export const isIsoCodeTaken = (isoCode: string, excludeId?: string): boolean => {
  return mockCountriesRef.some(c =>
    c.iso_code.toLowerCase() === isoCode.toLowerCase() && c.id !== excludeId
  )
}

// Vérifier si un code ISO 3 est déjà utilisé
export const isIsoCode3Taken = (isoCode3: string, excludeId?: string): boolean => {
  return mockCountriesRef.some(c =>
    c.iso_code3?.toLowerCase() === isoCode3.toLowerCase() && c.id !== excludeId
  )
}

// Statistiques des pays
export const getCountryStats = (): CountryStats => {
  const countries = mockCountriesRef
  return {
    total: countries.length,
    active: countries.filter(c => c.active).length,
    inactive: countries.filter(c => !c.active).length,
    with_phone_code: countries.filter(c => c.phone_code).length,
    with_arabic_name: countries.filter(c => c.name_ar).length
  }
}

// Obtenir l'emoji du drapeau depuis le code ISO
export const getCountryFlagEmoji = (isoCode: string): string => {
  const code = isoCode.toUpperCase()
  if (code.length !== 2) return ''
  const codePoints = [...code].map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Formater l'indicatif téléphonique
export const formatPhoneCodeDisplay = (phoneCode: string | null): string => {
  if (!phoneCode) return '-'
  return phoneCode.startsWith('+') ? phoneCode : `+${phoneCode}`
}

// Valider le format d'un indicatif téléphonique
export const validatePhoneCodeFormat = (phoneCode: string): boolean => {
  const pattern = /^\+?\d{1,4}$/
  return pattern.test(phoneCode)
}

// Valider le format d'un code ISO 2
export const validateIsoCode = (isoCode: string): boolean => {
  const pattern = /^[A-Z]{2}$/
  return pattern.test(isoCode.toUpperCase())
}

// Valider le format d'un code ISO 3
export const validateIsoCode3 = (isoCode3: string): boolean => {
  const pattern = /^[A-Z]{3}$/
  return pattern.test(isoCode3.toUpperCase())
}

// Liste des pays pour un sélecteur (actifs uniquement)
export const getCountriesForSelectRef = (): Array<{ id: string; label: string; iso_code: string; flag: string }> => {
  return getActiveCountriesRef().map(c => ({
    id: c.id,
    label: c.name_fr,
    iso_code: c.iso_code,
    flag: getCountryFlagEmoji(c.iso_code)
  }))
}
