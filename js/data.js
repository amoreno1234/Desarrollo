// Panini FIFA World Cup 2026 - Base de datos de estampas

const TEAMS = [
  // CONMEBOL
  { id: 'ARG', name: 'Argentina',           flag: '🇦🇷', group: 'E', conf: 'CONMEBOL', color: '#74ACDF',
    players: ['E. Martínez', 'L. Messi', 'Á. Di María', 'R. De Paul', 'N. Molina', 'C. Romero', 'A. Mac Allister'] },
  { id: 'BRA', name: 'Brasil',              flag: '🇧🇷', group: 'E', conf: 'CONMEBOL', color: '#009C3B',
    players: ['Alisson', 'Vinícius Jr.', 'Rodrygo', 'Raphinha', 'Casemiro', 'Marquinhos', 'Endrick'] },
  { id: 'COL', name: 'Colombia',            flag: '🇨🇴', group: 'F', conf: 'CONMEBOL', color: '#FCD116',
    players: ['D. Vargas', 'J. Rodríguez', 'L. Díaz', 'J. Borja', 'J. Cuadrado', 'D. Mina', 'R. Córdoba'] },
  { id: 'ECU', name: 'Ecuador',             flag: '🇪🇨', group: 'F', conf: 'CONMEBOL', color: '#FFD100',
    players: ['H. Domínguez', 'P. Estupiñán', 'A. Plata', 'M. Caicedo', 'J. Ibarra', 'G. Preciado', 'E. Valencia'] },
  { id: 'URU', name: 'Uruguay',             flag: '🇺🇾', group: 'G', conf: 'CONMEBOL', color: '#5EB6E4',
    players: ['S. Rochet', 'E. Cavani', 'L. Suárez', 'F. Valverde', 'D. Núñez', 'R. Bentancur', 'J. Araújo'] },
  { id: 'VEN', name: 'Venezuela',           flag: '🇻🇪', group: 'G', conf: 'CONMEBOL', color: '#CF142B',
    players: ['R. Romo', 'Y. Herrera', 'S. Soteldo', 'S. Machís', 'J. Quijada', 'C. Cásseres', 'O. Murillo'] },

  // CONCACAF
  { id: 'USA', name: 'Estados Unidos',      flag: '🇺🇸', group: 'A', conf: 'CONCACAF', color: '#B22234',
    players: ['M. Turner', 'C. Pulisic', 'G. Reyna', 'W. McKennie', 'T. Adams', 'B. Aaronson', 'T. Weah'] },
  { id: 'MEX', name: 'México',              flag: '🇲🇽', group: 'A', conf: 'CONCACAF', color: '#006847',
    players: ['G. Ochoa', 'H. Lozano', 'R. Antuna', 'J. Álvarez', 'J. Sánchez', 'S. Martín', 'O. Vega'] },
  { id: 'CAN', name: 'Canadá',              flag: '🇨🇦', group: 'B', conf: 'CONCACAF', color: '#FF0000',
    players: ['M. Borjan', 'A. Davies', 'J. David', 'A. Johnston', 'T. Buchanan', 'R. Laryea', 'J. Osorio'] },
  { id: 'PAN', name: 'Panamá',              flag: '🇵🇦', group: 'B', conf: 'CONCACAF', color: '#DA121A',
    players: ['O. Mosquera', 'G. Torres', 'J. Murillo', 'A. Godoy', 'A. Davis', 'C. Barrow', 'A. Rodríguez'] },
  { id: 'JAM', name: 'Jamaica',             flag: '🇯🇲', group: 'C', conf: 'CONCACAF', color: '#000000',
    players: ['A. Blake', 'L. Bailey', 'M. Antonio', 'D. Lowe', 'K. Nicholson', 'D. Bell', 'J. Pinnock'] },
  { id: 'HON', name: 'Honduras',            flag: '🇭🇳', group: 'C', conf: 'CONCACAF', color: '#0073CF',
    players: ['L. López', 'A. Elis', 'J. Pereira', 'D. García', 'M. Martínez', 'E. Álvarez', 'J. Benguche'] },
  { id: 'CRC', name: 'Costa Rica',          flag: '🇨🇷', group: 'D', conf: 'CONCACAF', color: '#002B7F',
    players: ['K. Navas', 'J. Campbell', 'B. Contreras', 'A. Torres', 'F. Duarte', 'Y. Borges', 'J. López'] },
  { id: 'SLV', name: 'El Salvador',         flag: '🇸🇻', group: 'D', conf: 'CONCACAF', color: '#0F47AF',
    players: ['M. Flores', 'N. Rugamas', 'E. Rivas', 'W. Clavel', 'J. Alvarado', 'N. Morales', 'R. Hernández'] },

  // UEFA
  { id: 'ESP', name: 'España',              flag: '🇪🇸', group: 'H', conf: 'UEFA', color: '#AA151B',
    players: ['U. Simón', 'Pedri', 'L. Yamal', 'Á. Morata', 'Rodri', 'D. Carvajal', 'F. Torres'] },
  { id: 'FRA', name: 'Francia',             flag: '🇫🇷', group: 'H', conf: 'UEFA', color: '#003189',
    players: ['M. Maignan', 'K. Mbappé', 'A. Griezmann', 'E. Camavinga', 'D. Upamecano', 'A. Tchouameni', 'O. Dembélé'] },
  { id: 'GER', name: 'Alemania',            flag: '🇩🇪', group: 'I', conf: 'UEFA', color: '#000000',
    players: ['M. Neuer', 'J. Musiala', 'F. Wirtz', 'K. Havertz', 'A. Rüdiger', 'J. Kimmich', 'I. Gündogan'] },
  { id: 'ENG', name: 'Inglaterra',          flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'I', conf: 'UEFA', color: '#003F7F',
    players: ['J. Pickford', 'J. Bellingham', 'H. Kane', 'B. Saka', 'P. Foden', 'T. Alexander-Arnold', 'K. Trippier'] },
  { id: 'POR', name: 'Portugal',            flag: '🇵🇹', group: 'J', conf: 'UEFA', color: '#006600',
    players: ['D. Costa', 'C. Ronaldo', 'J. Félix', 'R. Leão', 'D. Dalot', 'Vitinha', 'N. Cancelo'] },
  { id: 'ITA', name: 'Italia',              flag: '🇮🇹', group: 'J', conf: 'UEFA', color: '#003399',
    players: ['G. Donnarumma', 'N. Barella', 'G. Raspadori', 'M. Verratti', 'L. Pellegrini', 'M. Locatelli', 'A. Bastoni'] },
  { id: 'NED', name: 'Países Bajos',        flag: '🇳🇱', group: 'K', conf: 'UEFA', color: '#FF6600',
    players: ['M. Flekken', 'V. van Dijk', 'M. Depay', 'F. de Jong', 'D. Dumfries', 'C. Gakpo', 'N. Aké'] },
  { id: 'BEL', name: 'Bélgica',             flag: '🇧🇪', group: 'K', conf: 'UEFA', color: '#EF3340',
    players: ['K. Casteels', 'K. De Bruyne', 'R. Lukaku', 'J. Doku', 'L. Trossard', 'T. Hazard', 'T. Castagne'] },
  { id: 'CRO', name: 'Croacia',             flag: '🇭🇷', group: 'L', conf: 'UEFA', color: '#FF0000',
    players: ['D. Livaković', 'L. Modrić', 'J. Gvardiol', 'M. Kovačić', 'M. Pašalić', 'B. Šutalo', 'L. Majer'] },
  { id: 'SUI', name: 'Suiza',               flag: '🇨🇭', group: 'L', conf: 'UEFA', color: '#FF0000',
    players: ['Y. Sommer', 'G. Xhaka', 'B. Embolo', 'X. Shaqiri', 'M. Akanji', 'D. Zakaria', 'N. Okafor'] },
  { id: 'AUT', name: 'Austria',             flag: '🇦🇹', group: 'A', conf: 'UEFA', color: '#ED2939',
    players: ['P. Pentz', 'D. Alaba', 'M. Arnautović', 'M. Sabitzer', 'F. Lazaro', 'S. Wöber', 'K. Wimmer'] },
  { id: 'DEN', name: 'Dinamarca',           flag: '🇩🇰', group: 'B', conf: 'UEFA', color: '#C60C30',
    players: ['K. Schmeichel', 'C. Eriksen', 'M. Hjulmand', 'P. Højbjerg', 'A. Christensen', 'J. Mæhle', 'R. Olsen'] },
  { id: 'SRB', name: 'Serbia',              flag: '🇷🇸', group: 'C', conf: 'UEFA', color: '#C6363C',
    players: ['V. Milinkovic-Savic', 'D. Vlahović', 'D. Tadić', 'N. Milenković', 'S. Ilić', 'A. Živković', 'S. Lukić'] },
  { id: 'POL', name: 'Polonia',             flag: '🇵🇱', group: 'D', conf: 'UEFA', color: '#DC143C',
    players: ['W. Szczęsny', 'R. Lewandowski', 'P. Zieliński', 'M. Cash', 'J. Bednárek', 'A. Milik', 'K. Frankowski'] },
  { id: 'TUR', name: 'Turquía',             flag: '🇹🇷', group: 'E', conf: 'UEFA', color: '#E30A17',
    players: ['A. Günok', 'H. Çalhanoğlu', 'C. Ünder', 'K. Yıldız', 'Ç. Söyüncü', 'M. Demiral', 'A. Akgün'] },
  { id: 'ROU', name: 'Rumania',             flag: '🇷🇴', group: 'F', conf: 'UEFA', color: '#002B7F',
    players: ['F. Niță', 'I. Hagi', 'R. Drăgușin', 'R. Marin', 'D. Mihăilă', 'C. Băncioiu', 'D. Man'] },

  // CAF
  { id: 'MAR', name: 'Marruecos',           flag: '🇲🇦', group: 'G', conf: 'CAF', color: '#006233',
    players: ['Y. Bono', 'H. Ziyech', 'Y. En-Nesyri', 'A. Ounahi', 'A. Hakimi', 'R. Saïss', 'N. Aguerd'] },
  { id: 'SEN', name: 'Senegal',             flag: '🇸🇳', group: 'G', conf: 'CAF', color: '#00853F',
    players: ['E. Mendy', 'S. Mané', 'I. Gueye', 'I. Diatta', 'K. Koulibaly', 'I. Sarr', 'N. Jackson'] },
  { id: 'NGA', name: 'Nigeria',             flag: '🇳🇬', group: 'H', conf: 'CAF', color: '#008751',
    players: ['S. Nwabali', 'V. Osimhen', 'A. Lookman', 'K. Iheanacho', 'W. Ndidi', 'W. Troost-Ekong', 'S. Simon'] },
  { id: 'EGY', name: 'Egipto',              flag: '🇪🇬', group: 'H', conf: 'CAF', color: '#CE1126',
    players: ['M. El Shenawy', 'M. Salah', 'T. Mohamed', 'A. Elneny', 'A. Hegazi', 'O. Ashour', 'M. Ramadan'] },
  { id: 'RSA', name: 'Sudáfrica',           flag: '🇿🇦', group: 'I', conf: 'CAF', color: '#007A4D',
    players: ['R. Williams', 'P. Tau', 'T. Nurkovic', 'K. Dolly', 'M. Hlanti', 'L. Modise', 'L. Mothiba'] },
  { id: 'MLI', name: 'Mali',                flag: '🇲🇱', group: 'I', conf: 'CAF', color: '#009A00',
    players: ['D. Diarra', 'S. Koné', 'A. Doumbia', 'B. Coulibaly', 'K. Maïga', 'Y. Haïdara', 'A. Dembélé'] },
  { id: 'COD', name: 'RD del Congo',        flag: '🇨🇩', group: 'J', conf: 'CAF', color: '#007FFF',
    players: ['Y. Bolasie', 'G. Kakuta', 'C. Bakambu', 'C. Mbemba', 'C. Kayembe', 'P. Kayamba', 'G. Luyindama'] },
  { id: 'TUN', name: 'Túnez',               flag: '🇹🇳', group: 'J', conf: 'CAF', color: '#E70013',
    players: ['A. Ben Mustapha', 'Y. Msakni', 'S. Khazri', 'A. Ben Romdhane', 'N. Sliti', 'O. Talbi', 'R. Ghandri'] },
  { id: 'CMR', name: 'Camerún',             flag: '🇨🇲', group: 'K', conf: 'CAF', color: '#007A5E',
    players: ['A. Onana', 'V. Aboubakar', 'A. Anguissa', 'E. Choupo-Moting', 'N. Nkoulou', 'C. Tolo', 'C. Oyongo'] },

  // AFC
  { id: 'JPN', name: 'Japón',               flag: '🇯🇵', group: 'K', conf: 'AFC', color: '#BC002D',
    players: ['S. Gonda', 'T. Minamino', 'T. Kubo', 'K. Doan', 'H. Tanaka', 'W. Endo', 'T. Tomiyasu'] },
  { id: 'KOR', name: 'Corea del Sur',       flag: '🇰🇷', group: 'L', conf: 'AFC', color: '#CD2E3A',
    players: ['Kim Seung-gyu', 'Son Heung-min', 'Lee Jae-sung', 'Hwang Hee-chan', 'Kim Min-jae', 'Jung Woo-young', 'Cho Gue-sung'] },
  { id: 'IRN', name: 'Irán',                flag: '🇮🇷', group: 'L', conf: 'AFC', color: '#239F40',
    players: ['A. Hosseini', 'S. Azmoun', 'A. Jahanbakhsh', 'M. Taremi', 'E. Shojaeian', 'S. Ghoddos', 'R. Rezaeian'] },
  { id: 'KSA', name: 'Arabia Saudita',      flag: '🇸🇦', group: 'A', conf: 'AFC', color: '#006C35',
    players: ['M. Al-Rubaie', 'S. Al-Dawsari', 'F. Al-Ghannam', 'F. Al-Buraikan', 'S. Abdulhamid', 'Y. Al-Shahrani', 'A. Kanno'] },
  { id: 'AUS', name: 'Australia',           flag: '🇦🇺', group: 'B', conf: 'AFC', color: '#00843D',
    players: ['M. Ryan', 'C. Leckie', 'C. McGree', 'R. Irvine', 'J. Goodwin', 'A. Hrustic', 'A. Mabil'] },
  { id: 'QAT', name: 'Qatar',               flag: '🇶🇦', group: 'C', conf: 'AFC', color: '#8D1B3D',
    players: ['M. Al-Sheeb', 'Almoez Ali', 'A. Afif', 'H. Al-Haydos', 'K. Boudiaf', 'T. Khoukhi', 'A. Ahmad'] },
  { id: 'UZB', name: 'Uzbekistán',          flag: '🇺🇿', group: 'D', conf: 'AFC', color: '#1EB53A',
    players: ['U. Nesterov', 'E. Shomurodov', 'B. Jaloliddinov', 'A. Kholmatov', 'B. Tursunov', 'A. Kuvondikov', 'J. Sobirov'] },
  { id: 'JOR', name: 'Jordania',            flag: '🇯🇴', group: 'E', conf: 'AFC', color: '#007A3D',
    players: ['Y. Amer', 'M. Nasib', 'B. Al-Nakhaleh', 'O. Bani Yaseen', 'M. Al-Werikat', 'A. Hasan', 'H. Taha'] },

  // OFC
  { id: 'NZL', name: 'Nueva Zelanda',       flag: '🇳🇿', group: 'F', conf: 'OFC', color: '#00247D',
    players: ['O. Sail', 'C. Wood', 'L. Cacace', 'C. Bell', 'T. Boxall', 'B. Sutton', 'M. Ingham'] },
];

const INTRO_STICKERS = [
  { num: 1,  code: 'INT1',  name: 'Copa del Mundo FIFA™',       section: 'intro', sectionName: 'Introducción', type: 'special' },
  { num: 2,  code: 'INT2',  name: 'Logo Oficial 2026',          section: 'intro', sectionName: 'Introducción', type: 'special' },
  { num: 3,  code: 'INT3',  name: 'Mascota Oficial',            section: 'intro', sectionName: 'Introducción', type: 'special' },
  { num: 4,  code: 'INT4',  name: 'El Trofeo',                  section: 'intro', sectionName: 'Introducción', type: 'special' },
  { num: 5,  code: 'INT5',  name: 'El Trofeo (dorso)',          section: 'intro', sectionName: 'Introducción', type: 'special' },
  { num: 6,  code: 'STA1', name: 'SoFi Stadium - Los Ángeles', section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 7,  code: 'STA2', name: 'MetLife Stadium - Nueva York',section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 8,  code: 'STA3', name: 'AT&T Stadium - Dallas',       section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 9,  code: 'STA4', name: 'Hard Rock Stadium - Miami',   section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 10, code: 'STA5', name: 'Levi\'s Stadium - SF',        section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 11, code: 'STA6', name: 'Gillette Stadium - Boston',   section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 12, code: 'STA7', name: 'Arrowhead Stadium - KC',      section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 13, code: 'STA8', name: 'BMO Field - Toronto',         section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 14, code: 'STA9', name: 'BC Place - Vancouver',        section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 15, code: 'STA10',name: 'Estadio Azteca - CDMX',       section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 16, code: 'STA11',name: 'Estadio Akron - Guadalajara', section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 17, code: 'STA12',name: 'Estadio BBVA - Monterrey',    section: 'stadiums', sectionName: 'Estadios', type: 'stadium' },
  { num: 18, code: 'INT6', name: 'Ceremonia de Apertura',        section: 'intro', sectionName: 'Introducción', type: 'special' },
  { num: 19, code: 'INT7', name: 'FIFA World Cup 2026™ Portada', section: 'intro', sectionName: 'Introducción', type: 'special' },
  { num: 20, code: 'INT8', name: 'Historia del Torneo',           section: 'intro', sectionName: 'Introducción', type: 'special' },
];

function buildStickerDatabase() {
  const stickers = [...INTRO_STICKERS];
  let counter = 21;

  for (const team of TEAMS) {
    stickers.push({
      num: counter++, code: `${team.id}-B`,
      name: `${team.name} - Escudo`,
      section: team.id, sectionName: team.name,
      flag: team.flag, color: team.color,
      group: team.group, conf: team.conf, type: 'badge'
    });
    stickers.push({
      num: counter++, code: `${team.id}-F`,
      name: `${team.name} - Foto del equipo`,
      section: team.id, sectionName: team.name,
      flag: team.flag, color: team.color,
      group: team.group, conf: team.conf, type: 'team'
    });
    team.players.forEach((player, i) => {
      stickers.push({
        num: counter++, code: `${team.id}-${i + 1}`,
        name: player,
        section: team.id, sectionName: team.name,
        flag: team.flag, color: team.color,
        group: team.group, conf: team.conf, type: 'player'
      });
    });
  }

  // Estampas FWC especiales (brillo / oro)
  const fwcNames = [
    'L. Messi ⭐', 'C. Ronaldo ⭐', 'K. Mbappé ⭐', 'Vinícius Jr. ⭐',
    'J. Bellingham ⭐', 'P. Foden ⭐', 'R. Leão ⭐', 'K. De Bruyne ⭐',
    'L. Modrić ⭐', 'Son Heung-min ⭐', 'V. Osimhen ⭐', 'A. Hakimi ⭐',
    'F. Valverde ⭐', 'Pedri ⭐', 'J. Musiala ⭐', 'F. Wirtz ⭐',
    'L. Yamal ⭐', 'K. Havertz ⭐', 'A. Griezmann ⭐', 'M. Salah ⭐',
  ];
  fwcNames.forEach((name, i) => {
    stickers.push({
      num: counter++, code: `FWC${i + 1}`,
      name, section: 'fwc', sectionName: 'FWC Stars ⭐',
      flag: '⭐', color: '#C8A951', type: 'special'
    });
  });

  return stickers;
}

const ALL_STICKERS = buildStickerDatabase();
const STICKER_MAP = Object.fromEntries(ALL_STICKERS.map(s => [s.code.toUpperCase(), s]));
const TOTAL = ALL_STICKERS.length;
