define([
    'backbone',
    'App'
], function (Backbone, App) {

    var CountriesModel = Backbone.Model.extend({

        defaults: {
          countries: []
        },

        initialize: function (options) {
          
          var countries = [{
            ID: 'AFG',
            name: 'Afghanistan'
          }, {
            ID: 'ALA',
            name: 'Aland Islands'
          }, {
            ID: 'ALB',
            name: 'Albania'
          }, {
            ID: 'DZA',
            name: 'Algeria'
          }, {
            ID: 'ASM',
            name: 'American Samoa'
          }, {
            ID: 'AND',
            name: 'Andorra'
          }, {
            ID: 'AGO',
            name: 'Angola'
          }, {
            ID: 'AIA',
            name: 'Anguilla'
          }, {
            ID: 'ATA',
            name: 'Antarctica'
          }, {
            ID: 'ATG',
            name: 'Antigua and Barbuda'
          }, {
            ID: 'AGR',
            name: 'Argentina'
          }, {
            ID: 'ARG',
            name: 'Argentina'
          }, {
            ID: 'ARM',
            name: 'Armenia'
          }, {
            ID: 'ABW',
            name: 'Aruba'
          }, {
            ID: 'AUS',
            name: 'Australia'
          }, {
            ID: 'AUT',
            name: 'Austria'
          }, {
            ID: 'AZE',
            name: 'Azerbaijan'
          }, {
            ID: 'BHS',
            name: 'Bahamas'
          }, {
            ID: 'BHR',
            name: 'Bahrain'
          }, {
            ID: 'BGD',
            name: 'Bangladesh'
          }, {
            ID: 'BRB',
            name: 'Barbados'
          }, {
            ID: 'BEL',
            name: 'Belgium'
          }, {
            ID: 'BLZ',
            name: 'Belize'
          }, {
            ID: 'BEN',
            name: 'Benin'
          }, {
            ID: 'BMU',
            name: 'Bermuda'
          }, {
            ID: 'BTN',
            name: 'Bhutan'
          }, {
            ID: 'BOL',
            name: 'Bolivia'
          }, {
            ID: 'BIH',
            name: 'Bosnia and Herzegovina'
          }, {
            ID: 'BWA',
            name: 'Botswana'
          }, {
            ID: 'BRA',
            name: 'Brazil'
          }, {
            ID: 'IOT',
            name: 'British Indian Ocean Territory'
          }, {
            ID: 'VGB',
            name: 'British Virgin Islands'
          }, {
            ID: 'BRN',
            name: 'Brunei'
          }, {
            ID: 'BGR',
            name: 'Bulgaria'
          }, {
            ID: 'BFA',
            name: 'Burkina Faso'
          }, {
            ID: 'BDI',
            name: 'Burundi'
          }, {
            ID: 'KHM',
            name: 'Cambodia'
          }, {
            ID: 'CMR',
            name: 'Cameroon'
          }, {
            ID: 'CAN',
            name: 'Canada'
          }, {
            ID: 'Can',
            name: 'Canada'
          }, {
            ID: 'CPV',
            name: 'Cape Verde'
          }, {
            ID: 'CYM',
            name: 'Cayman Islands'
          }, {
            ID: 'CAF',
            name: 'Central African Republic'
          }, {
            ID: 'TCD',
            name: 'Chad'
          }, {
            ID: 'CHL',
            name: 'Chile'
          }, {
            ID: 'CHN',
            name: 'China'
          }, {
            ID: 'CXR',
            name: 'Christmas Island'
          }, {
            ID: 'CCK',
            name: 'Cocos (Keeling) Islands'
          }, {
            ID: 'COL',
            name: 'Colombia'
          }, {
            ID: 'COM',
            name: 'Comoros'
          }, {
            ID: 'COK',
            name: 'Cook Islands'
          }, {
            ID: 'CRC',
            name: 'Costa Rica'
          }, {
            ID: 'HRV',
            name: 'Croatia'
          }, {
            ID: 'CYP',
            name: 'Cyprus'
          }, {
            ID: 'CZE',
            name: 'Czech Republic'
          }, {
            ID: 'DNK',
            name: 'Denmark'
          }, {
            ID: 'DJI',
            name: 'Djibouti'
          }, {
            ID: 'DMA',
            name: 'Dominica'
          }, {
            ID: 'DOM',
            name: 'Dominican Republic'
          }, {
            ID: 'ECU',
            name: 'Ecuador'
          }, {
            ID: 'EGY',
            name: 'Egypt'
          }, {
            ID: 'SLV',
            name: 'El Salvador'
          }, {
            ID: 'GNQ',
            name: 'Equatorial Guinea'
          }, {
            ID: 'ERI',
            name: 'Eritrea'
          }, {
            ID: 'EST',
            name: 'Estonia'
          }, {
            ID: 'ETH',
            name: 'Ethiopia'
          }, {
            ID: 'FLK',
            name: 'Falkland Islands'
          }, {
            ID: 'FRO',
            name: 'Faroe Islands'
          }, {
            ID: 'FJI',
            name: 'Fiji'
          }, {
            ID: 'FIN',
            name: 'Finland'
          }, {
            ID: 'FRA',
            name: 'France'
          }, {
            ID: 'PYF',
            name: 'French Polynesia'
          }, {
            ID: 'GAB',
            name: 'Gabon'
          }, {
            ID: 'GMB',
            name: 'Gambia'
          }, {
            ID: 'GEO',
            name: 'Georgia'
          }, {
            ID: 'DEU',
            name: 'Germany'
          }, {
            ID: 'GHA',
            name: 'Ghana'
          }, {
            ID: 'GIB',
            name: 'Gibraltar'
          }, {
            ID: 'GRC',
            name: 'Greece'
          }, {
            ID: 'GRL',
            name: 'Greenland'
          }, {
            ID: 'GRD',
            name: 'Grenada'
          }, {
            ID: 'GUM',
            name: 'Guam'
          }, {
            ID: 'GTM',
            name: 'Guatemala'
          }, {
            ID: 'GIN',
            name: 'Guinea'
          }, {
            ID: 'GNB',
            name: 'Guinea-Bissau'
          }, {
            ID: 'GUY',
            name: 'Guyana'
          }, {
            ID: 'HTI',
            name: 'Haiti'
          }, {
            ID: 'VAT',
            name: 'Holy See (Vatican City)'
          }, {
            ID: 'HND',
            name: 'Honduras'
          }, {
            ID: 'HKG',
            name: 'Hong Kong'
          }, {
            ID: 'HUN',
            name: 'Hungary'
          }, {
            ID: 'ISL',
            name: 'Iceland'
          }, {
            ID: 'IND',
            name: 'India'
          }, {
            ID: 'IDN',
            name: 'Indonesia'
          }, {
            ID: 'IRL',
            name: 'Ireland'
          }, {
            ID: 'IMN',
            name: 'Isle of Man'
          }, {
            ID: 'ISR',
            name: 'Israel'
          }, {
            ID: 'ITA',
            name: 'Italy'
          }, {
            ID: 'CIV',
            name: 'Ivory Coast'
          }, {
            ID: 'JAM',
            name: 'Jamaica'
          }, {
            ID: 'JPN',
            name: 'Japan'
          }, {
            ID: 'JEY',
            name: 'Jersey'
          }, {
            ID: 'JOR',
            name: 'Jordan'
          }, {
            ID: 'KAZ',
            name: 'Kazakhstan'
          }, {
            ID: 'KEN',
            name: 'Kenya'
          }, {
            ID: 'KIR',
            name: 'Kiribati'
          }, {
            ID: 'KWT',
            name: 'Kuwait'
          }, {
            ID: 'KGZ',
            name: 'Kyrgyzstan'
          }, {
            ID: 'LAO',
            name: 'Laos'
          }, {
            ID: 'LVA',
            name: 'Latvia'
          }, {
            ID: 'LSO',
            name: 'Lesotho'
          }, {
            ID: 'LBR',
            name: 'Liberia'
          }, {
            ID: 'LIE',
            name: 'Liechtenstein'
          }, {
            ID: 'LTU',
            name: 'Lithuania'
          }, {
            ID: 'LUX',
            name: 'Luxembourg'
          }, {
            ID: 'MAC',
            name: 'Macau'
          }, {
            ID: 'MKD',
            name: 'Macedonia'
          }, {
            ID: 'MDG',
            name: 'Madagascar'
          }, {
            ID: 'MWI',
            name: 'Malawi'
          }, {
            ID: 'MYS',
            name: 'Malaysia'
          }, {
            ID: 'MDV',
            name: 'Maldives'
          }, {
            ID: 'MLI',
            name: 'Mali'
          }, {
            ID: 'MLT',
            name: 'Malta'
          }, {
            ID: 'MHL',
            name: 'Marshall Islands'
          }, {
            ID: 'MRT',
            name: 'Mauritania'
          }, {
            ID: 'MUS',
            name: 'Mauritius'
          }, {
            ID: 'MYT',
            name: 'Mayotte'
          }, {
            ID: 'MEX',
            name: 'Mexico'
          }, {
            ID: 'FSM',
            name: 'Micronesia'
          }, {
            ID: 'MDA',
            name: 'Moldova'
          }, {
            ID: 'MCO',
            name: 'Monaco'
          }, {
            ID: 'MNG',
            name: 'Mongolia'
          }, {
            ID: 'MNE',
            name: 'Montenegro'
          }, {
            ID: 'MSR',
            name: 'Montserrat'
          }, {
            ID: 'MAR',
            name: 'Morocco'
          }, {
            ID: 'MOZ',
            name: 'Mozambique'
          }, {
            ID: 'NAM',
            name: 'Namibia'
          }, {
            ID: 'NRU',
            name: 'Nauru'
          }, {
            ID: 'NPL',
            name: 'Nepal'
          }, {
            ID: 'NLD',
            name: 'Netherlands'
          }, {
            ID: 'ANT',
            name: 'Netherlands Antilles'
          }, {
            ID: 'NCL',
            name: 'New Caledonia'
          }, {
            ID: 'NZL',
            name: 'New Zealand'
          }, {
            ID: 'NIC',
            name: 'Nicaragua'
          }, {
            ID: 'NER',
            name: 'Niger'
          }, {
            ID: 'NGA',
            name: 'Nigeria'
          }, {
            ID: 'NIU',
            name: 'Niue'
          }, {
            ID: 'NFK',
            name: 'Norfolk Island'
          }, {
            ID: 'MNP',
            name: 'Northern Mariana Islands'
          }, {
            ID: 'NOR',
            name: 'Norway'
          }, {
            ID: 'OMN',
            name: 'Oman'
          }, {
            ID: 'PAK',
            name: 'Pakistan'
          }, {
            ID: 'PLW',
            name: 'Palau'
          }, {
            ID: 'PAN',
            name: 'Panama'
          }, {
            ID: 'PNG',
            name: 'Papua New Guinea'
          }, {
            ID: 'PRY',
            name: 'Paraguay'
          }, {
            ID: 'PER',
            name: 'Peru'
          }, {
            ID: 'PHL',
            name: 'Philippines'
          }, {
            ID: 'PCN',
            name: 'Pitcairn Islands'
          }, {
            ID: 'POL',
            name: 'Poland'
          }, {
            ID: 'PRT',
            name: 'Portugal'
          }, {
            ID: 'PRI',
            name: 'Puerto Rico'
          }, {
            ID: 'QAT',
            name: 'Qatar'
          }, {
            ID: 'COG',
            name: 'Republic of the Congo'
          }, {
            ID: 'ROU',
            name: 'Romania'
          }, {
            ID: 'RUS',
            name: 'Russia'
          }, {
            ID: 'RWA',
            name: 'Rwanda'
          }, {
            ID: 'BLM',
            name: 'Saint Barthelemy'
          }, {
            ID: 'SHN',
            name: 'Saint Helena'
          }, {
            ID: 'KNA',
            name: 'Saint Kitts and Nevis'
          }, {
            ID: 'LCA',
            name: 'Saint Lucia'
          }, {
            ID: 'MAF',
            name: 'Saint Martin'
          }, {
            ID: 'SPM',
            name: 'Saint Pierre and Miquelon'
          }, {
            ID: 'VCT',
            name: 'Saint Vincent and the Grenadines'
          }, {
            ID: 'WSM',
            name: 'Samoa'
          }, {
            ID: 'SMR',
            name: 'San Marino'
          }, {
            ID: 'STP',
            name: 'Sao Tome and Principe'
          }, {
            ID: 'SAU',
            name: 'Saudi Arabia'
          }, {
            ID: 'SEN',
            name: 'Senegal'
          }, {
            ID: 'SRB',
            name: 'Serbia'
          }, {
            ID: 'SYC',
            name: 'Seychelles'
          }, {
            ID: 'SLE',
            name: 'Sierra Leone'
          }, {
            ID: 'SGP',
            name: 'Singapore'
          }, {
            ID: 'SVK',
            name: 'Slovakia'
          }, {
            ID: 'SVN',
            name: 'Slovenia'
          }, {
            ID: 'SLB',
            name: 'Solomon Islands'
          }, {
            ID: 'ZAF',
            name: 'South Africa'
          }, {
            ID: 'KOR',
            name: 'South Korea'
          }, {
            ID: 'ESP',
            name: 'Spain'
          }, {
            ID: 'LKA',
            name: 'Sri Lanka'
          }, {
            ID: 'SUR',
            name: 'Suriname'
          }, {
            ID: 'SJM',
            name: 'Svalbard'
          }, {
            ID: 'SWZ',
            name: 'Swaziland'
          }, {
            ID: 'SWE',
            name: 'Sweden'
          }, {
            ID: 'CHE',
            name: 'Switzerland'
          }, {
            ID: 'TWN',
            name: 'Taiwan'
          }, {
            ID: 'TJK',
            name: 'Tajikistan'
          }, {
            ID: 'TZA',
            name: 'Tanzania'
          }, {
            ID: 'THA',
            name: 'Thailand'
          }, {
            ID: 'TLS',
            name: 'Timor-Leste'
          }, {
            ID: 'TGO',
            name: 'Togo'
          }, {
            ID: 'TKL',
            name: 'Tokelau'
          }, {
            ID: 'TON',
            name: 'Tonga'
          }, {
            ID: 'TTO',
            name: 'Trinidad and Tobago'
          }, {
            ID: 'TUN',
            name: 'Tunisia'
          }, {
            ID: 'TUR',
            name: 'Turkey'
          }, {
            ID: 'TKM',
            name: 'Turkmenistan'
          }, {
            ID: 'TCA',
            name: 'Turks and Caicos Islands'
          }, {
            ID: 'TUV',
            name: 'Tuvalu'
          }, {
            ID: 'VIR',
            name: 'US Virgin Islands'
          }, {
            ID: 'UGA',
            name: 'Uganda'
          }, {
            ID: 'UKR',
            name: 'Ukraine'
          }, {
            ID: 'ARE',
            name: 'United Arab Emirates'
          }, {
            ID: 'GBR',
            name: 'United Kingdom'
          }, {
            ID: 'USA',
            name: 'United States'
          }, {
            ID: 'URY',
            name: 'Uruguay'
          }, {
            ID: 'UZB',
            name: 'Uzbekistan'
          }, {
            ID: 'VUT',
            name: 'Vanuatu'
          }, {
            ID: 'VEN',
            name: 'Venezuela'
          }, {
            ID: 'VNM',
            name: 'Vietnam'
          }, {
            ID: 'WLF',
            name: 'Wallis and Futuna'
          }, {
            ID: 'ESH',
            name: 'Western Sahara'
          }, {
            ID: 'ZMB',
            name: 'Zambia'
          }];
          
          // Set get example.
          this.set('countries', countries);
        }
    });
    
    return CountriesModel;
});