/**
 * Playlist catalogue for the Safar experience.
 *
 * Two kinds of source are supported:
 *  - `youtube` plays videos through the IFrame Player API, queued by video id
 *    from the snapshots below. Loading by playlist id instead fails with error
 *    150 on some playlists (the player reports ready but hands back an empty
 *    queue), so these snapshots — not the live playlist — decide what plays.
 *    Re-run the extraction to pick up playlist changes.
 *  - `audio` plays plain media files through an <audio> element. No section uses
 *    it right now; it stays as the path for music you host yourself — drop files
 *    into `public/audio/` and point `src` at e.g. `audio/my-track.mp3`.
 *
 * Snapshot rows are `[videoId, raw YouTube title, channel]`. Titles are stored
 * exactly as YouTube reports them and tidied by `cleanTitle`, so there is one
 * cleaning implementation shared with live player data.
 */

import { cleanTitle } from './clean-title';

export type PlaylistId = 'safar' | 'bus-drive' | 'saloon' | 'emraan';

export interface Track {
  /** YouTube video id, or a local id for audio tracks. */
  readonly id: string;
  readonly title: string;
  readonly artist: string;
}

export interface AudioTrack extends Track {
  readonly src: string;
}

export type PlaylistSource =
  | { readonly kind: 'audio'; readonly tracks: readonly AudioTrack[] }
  | {
      readonly kind: 'youtube';
      /** Absent when the section was assembled by hand rather than from a playlist. */
      readonly playlistId?: string;
      readonly tracks: readonly Track[];
    };

export interface Playlist {
  readonly id: PlaylistId;
  readonly name: string;
  /** Devanagari word painted into the hero illustration. */
  readonly wordmark: string;
  /** Open-in-YouTube-Music target for the top-right badge. */
  readonly youTubeUrl: string;
  readonly source: PlaylistSource;
}

type SnapshotRow = readonly [id: string, rawTitle: string, channel: string];

const toTracks = (rows: readonly SnapshotRow[]): readonly Track[] =>
  rows.map(([id, rawTitle, artist]) => ({ id, title: cleanTitle(rawTitle), artist }));

const youTubeUrl = (playlistId: string) => `https://music.youtube.com/playlist?list=${playlistId}`;

export const SAFAR_PLAYLIST_ID = 'PLGRi6lrpu8X4';
export const BUS_DRIVE_PLAYLIST_ID = 'PLeatb7hupNV_AWUl_7ttbsKeCQh8tF5N4';
export const SALOON_PLAYLIST_ID = 'PLTJ1PnzCWyFw';

/** The "Best of Emraan Hashmi" compilation the Emraan section was built from. */
export const EMRAAN_SOURCE_URL = 'https://music.youtube.com/watch?v=7AWIrVanz0w';

/** "Banger songs play in bus" — 50 tracks. */
const SAFAR_SNAPSHOT: readonly SnapshotRow[] = [
  [
    'cBGDDBHN22U',
    'Pehli Pehli Baar Mohabbat Ki Hai Full Video Song | Sirf Tum|Kumar Sanu,Alka Yagnik|Sanjay K, Priya G',
    'T-Series Bollywood Classics',
  ],
  [
    'lFdSi01tpYM',
    "Sochenge Tumhe Pyar- Lyrical | #Deewana | #RishiKapoor, Divya Bharti | 90's Best Song",
    'Ishtar Music',
  ],
  [
    'N0jnLZxYwYc',
    'Mujhse Mohabbat Ka Izhaar (HD)| Hum Hain Rahi Pyar Ke (1993)| Aamir Khan| Juhi Chawla| Romantic Song',
    'Shemaroo Filmi Gaane',
  ],
  [
    '3NWMK2MRqIk',
    'Tumsa Koi Pyaara | Khuddar | Govinda, Karisma Kapoor | Kumar Sanu, Alka Yagnik |Anu Malik, 90s Hits',
    'Tips Official',
  ],
  [
    '9b0iydtDZLU',
    "Waada Raha Sanam -4K | Akshay K & Ayesha J | Alka Y & Abhijeet | Khiladi | 90's Hindi Romantic Songs",
    'Ishtar Music',
  ],
  [
    'fg9G1dacXjk',
    'Chhupana Bhi Nahin Aata Full Video Song | Baazigar | Shahrukh Khan, Kajol | Vinod Rathod',
    'Venus Movies',
  ],
  [
    'u0AgbGWvzdA',
    'Jhanjharia Lyrical (Male) |Krishna | Suniel Shetty, Karisma Kapoor|Abhijeet Bhattacharya | Anu Malik',
    'Tips Official',
  ],
  [
    'jE1CavSI5TQ',
    "Husn Hai Suhana | Coolie No. 1 | Govinda & Karisma Kapoor | Abhijeet & Chandana Dixit | 90's Hits",
    'Tips Official',
  ],
  [
    'wYdXuNtJkPk',
    "Jeeye To Jeeye Kaise -Lyrical | Saajan | Pankaj Udhas | Salman Khan & Madhuri | 90's Hindi Sad Songs",
    'Ishtar Music',
  ],
  [
    'oFxbBeYhLqM',
    'Saaton Janam Main Tere Full Lyrical |Video Song | Dilwale | Ajay Devgan, Raveena Tandon | Kumar Sanu',
    'Ishtar Music',
  ],
  ['e-1xmmEb49I', 'To Chalun', 'Roopkumar Rathod (Official)'],
  [
    '7-ORLGKcnLQ',
    "Tumhein Dekhen Meri Aankhen | Divya Bharti | Kumar Sanu | Alka Yagnik | Rang Song | 90's Sad Song",
    'Tips Official',
  ],
  [
    'tPNwGuu_rQ4',
    'Lyrical: Tumhein Apna Banane Ki Kasam | Sadak | Kumar Sanu,Anuradha Paudwal |Sanjay Dutt,Pooja Bhatt',
    'T-Series Bollywood Classics',
  ],
  [
    'dDR4oiyjUBA',
    'Raah Mein Unse Mulaqat - Lyrical | Ajay Devgn, Tabu | Kumar Sanu, Alka Yagnik |Vijaypath | Anu Malik',
    'Tips Official',
  ],
  [
    'tRMzF4EVPHI',
    'Tu Jo Hans Hans Ke HD | Govinda, Aarti Chabria |Udit Narayan, Kavita Krishnamurthy |Raja Bhaiya Song',
    'Goldmines Gaane Sune Ansune',
  ],
  [
    'PqiddY3o3aY',
    'Dil Kehta Hai | Akele Hum Akele Tum | Kumar Sanu, Alka Yagnik | Aamir Khan | 90s Love Song',
    'Ishtar Music',
  ],
  [
    'Jtg2zyS_y_c',
    'Ae Kash Ke Hum Full Video - Kabhi Haan Kabhi Naa | Shah Rukh Khan, Suchitra | Kumar Sanu',
    'SonyMusicIndiaVEVO',
  ],
  [
    'i1IsLVz6T9Q',
    'Kumar Sanu & Sadhana Sargam Live Sydney - Teri umeed tera intezar - Deewana',
    'Chintan Ramola',
  ],
  [
    'bga_0ziOOfQ',
    'Woh Meri Neend Mera Chain Lyrical - Hum Hain Rahi Pyar Ke | Aamir Khan, Juhi Chawla | Sadhana Sargam',
    'Tips Official',
  ],
  [
    'g3ddCx2Uawo',
    'Dil Hai Ki Manta Nahin Full Audio Song (Female Version) | Anuradha Paudwal | Aamir Khan, Pooja Bhatt',
    'T-Series Bollywood Classics',
  ],
  [
    'QjqKXFGM3eI',
    "Chori Chori Dil Tera (HD) - Kumar Sanu Songs - Romantic Songs - 90's Love Song",
    'Shemaroo Filmi Gaane',
  ],
  [
    'Y-o8NQ8Y36A',
    'Is Tarah Aashiqui Ka Lyrical | Imtihan | Kumar Sanu | Saif Ali Khan, Raveena Tandon | Anu Malik',
    'Tips Official',
  ],
  [
    'qGOTe3KmCdY',
    'Kitna Haseen Chehra Full Lyrical Video Song | Dilwale | Ajay Devgan, Raveena Tandon | Kumar Sanu',
    'Ishtar Music',
  ],
  [
    '9f6GhUb-WdM',
    "Dil Cheer Ke Dekh | Divya Bharti | Kamal Sadanah | Kumar Sanu | Rang Movie | 90's Romantic Song",
    'Tips Official',
  ],
  [
    'E4HtYArLiwc',
    "Pucho Zara Pucho | Aamir Khan,Karisma Kapoor | Alka Yagnik,Kumar Sanu | Raja Hindustani | 90's Hit",
    'Tips Official',
  ],
  [
    'd5ZrSe1eDDU',
    'Woh Ladki Bahut Yaad Aati Hai - Kumar Sanu | Qayamat | Best Hindi Song',
    'Madhur Sangeet',
  ],
  [
    '1jjDs69WWUQ',
    'Lal Dupatta Full Song | Mujhse Shaadi Karogi | Salman Khan,Priyanka Chopra |Alka Yagnik,Udit Narayan',
    'T-Series',
  ],
  [
    'PlN6oP-Nlno',
    "Sona Kitna Sona Hai | Govinda, Karisma Kapoor | Udit N & Poornima | Hero No.1 | 90's Hits",
    'Tips Official',
  ],
  ['SF_cCyz6QQg', 'Humko Deewana Kar Gaye [Full Song] Humko Deewana Kar Gaye', 'T-Series'],
  [
    '_YjSmLlmqLM',
    'Aisi Deewangi - Lyrical Video | Deewana | Shahrukh Khan | Divya Bharti | Ishtar Music',
    'Ishtar Music',
  ],
  [
    'qkZiKkmaBtE',
    'आते जाते खूबसूरत आवारा सड़को पे Aate Jate Khoobsurat Awara - किशोर कुमार - अनुरोध - राजेश खन्ना  song',
    'Gaane Naye Purane',
  ],
  [
    'eVnG_Rqfgg4',
    'Neele Neele Ambar Par - Male Version Lyric Video - Kalaakaar | Sridevi | Kishore Kumar',
    'SonyMusicIndiaVEVO',
  ],
  [
    'mW4WRtL6GxM',
    'Is Pyar Se Meri Taraf Na Dekho - Lyrical | Sharukh K, Urmila M | Alka Y, Kumar S | Chamatkar Movie',
    'Tips Official',
  ],
  [
    'wuLJtA0uJro',
    'Hum Lakh Chupaye Pyar Magar | 4K Video Song | Jaan Tere Naam - Kumar Sanu, Asha Bhosle',
    'Ultra Bollywood',
  ],
  [
    'uIOrAkrjwp4',
    'Hum Yaar Hai Tumhare | Alka Yagnik | Udit Narayan | Haan Maine Bhi Pyaar Kiya (2002)',
    'Bollywood Sadabahar',
  ],
  [
    '5y_TCKNzAMI',
    'Tumse Milne Ko Dil Karta Hai ❤️🎶 | Phool Aur Kaante | Ajay Devgn & Madhoo | Kumar Sanu, Alka Yagnik',
    'Zee Music Classic',
  ],
  ['cBwl6qKrZd0', 'Ab Tere Dil Mein To - Kumar Sanu & Alka - Aarzoo', 'Likable Songs'],
  ['BaAoZA0fup0', 'Dil Ka Aalam (Full Song) | Aashiqui | Kumar Sanu | T-Series', 'T-Series'],
  [
    'nNhv8A_rJTg',
    'Oye Raju Pyar Na Kariyo Lyrical Video |Hadh Kar Di Aapne|Anand Bakshi|Anand Raj Anand|Govinda,Rani M',
    'T-Series Bollywood Classics',
  ],
  [
    's1NLjpj3aP4',
    "Jaa Bewafa Jaa Full Video Song - Altaf Raja | Best 90's Hindi Song",
    'Ishtar Music',
  ],
  ['u4NSsEIny1c', 'Muje Pine ka Shauk Nahi - Coolie (1983) Full VIdeo Song *HD*', 'Bolly HD Songs'],
  [
    'RjJxWRFfG3s',
    'Nahin Yeh Ho Nahin Sakta -Lyrical | Bobby Deol, Twinkle Khanna | Kumar Sanu, Sadhana Sargam| Barsaat',
    'Tips Official',
  ],
  [
    'rrzSZ0NMID4',
    'Barsaat Ke Mausam Mein | Naajayaz | Naseeruddin Shah | Kumar Sanu | Roop Kumar Rathod',
    'Bollywood Hits',
  ],
  [
    '1ziaNhD9xqE',
    'Meri Mehbooba Lyrical - Pardes | Shahrukh Khan & Mahima | Kumar Sanu & Alka Yagnik | Shahrukh Hits',
    'Tips Official',
  ],
  [
    'UCsW7nea7sI',
    "Ae Mere Humsafar - 4K Video | Shah Rukh Khan & Shilpa Shetty | Baazigar | 90's Hindi Romantic Song",
    'Ishtar Music',
  ],
  [
    '5dWbn_qER3s',
    'Tere Dar Par Sanam - Male Version - Phir Teri Kahani Yaad Aayee | Kumar Sanu | Rahul Roy',
    'Zee Music Classic',
  ],
  [
    'HIr_kpG4Fnc',
    'S. P. Balasubrahmanyam sings Tumse Milne Ki Tamanna Hai - तुमसे मिलने की तमन्ना from Saajan (1991)',
    'Hemantkumar Mahale',
  ],
  ['XR7qvTgQ19o', 'Taaron Ka Chamakta [Full Song] Hum Tumhare Hain Sanam', 'T-Series'],
  [
    'jEL02Nz7Dds',
    'Dono Hi Mohabbat Ke Full Video Song | Altaf Raja | Best Hindi Romantic Songs | Hindi Album Songs',
    'Ishtar Music',
  ],
  [
    'mocKoIhNJxk',
    'Ding Dong Dole Lyrical Video | Kucch To Hai | K K, Sunidhi Chauhan | Tushar Kapoor, Natassha',
    'T-Series Bollywood Classics',
  ],
];

/** "Bus Driver ki Playlist" — 54 tracks. */
const BUS_DRIVE_SNAPSHOT: readonly SnapshotRow[] = [
  [
    'N0jnLZxYwYc',
    'Mujhse Mohabbat Ka Izhaar (HD)| Hum Hain Rahi Pyar Ke (1993)| Aamir Khan| Juhi Chawla| Romantic Song',
    'Shemaroo Filmi Gaane',
  ],
  [
    '3NWMK2MRqIk',
    'Tumsa Koi Pyaara | Khuddar | Govinda, Karisma Kapoor | Kumar Sanu, Alka Yagnik |Anu Malik, 90s Hits',
    'Tips Official',
  ],
  [
    '9b0iydtDZLU',
    "Waada Raha Sanam -4K | Akshay K & Ayesha J | Alka Y & Abhijeet | Khiladi | 90's Hindi Romantic Songs",
    'Ishtar Music',
  ],
  [
    'fg9G1dacXjk',
    'Chhupana Bhi Nahin Aata Full Video Song | Baazigar | Shahrukh Khan, Kajol | Vinod Rathod',
    'Venus Movies',
  ],
  [
    'u0AgbGWvzdA',
    'Jhanjharia Lyrical (Male) |Krishna | Suniel Shetty, Karisma Kapoor|Abhijeet Bhattacharya | Anu Malik',
    'Tips Official',
  ],
  [
    'jE1CavSI5TQ',
    "Husn Hai Suhana | Coolie No. 1 | Govinda & Karisma Kapoor | Abhijeet & Chandana Dixit | 90's Hits",
    'Tips Official',
  ],
  [
    'wYdXuNtJkPk',
    "Jeeye To Jeeye Kaise -Lyrical | Saajan | Pankaj Udhas | Salman Khan & Madhuri | 90's Hindi Sad Songs",
    'Ishtar Music',
  ],
  [
    'cBGDDBHN22U',
    'Pehli Pehli Baar Mohabbat Ki Hai Full Video Song | Sirf Tum|Kumar Sanu,Alka Yagnik|Sanjay K, Priya G',
    'T-Series Bollywood Classics',
  ],
  [
    'oFxbBeYhLqM',
    'Saaton Janam Main Tere Full Lyrical |Video Song | Dilwale | Ajay Devgan, Raveena Tandon | Kumar Sanu',
    'Ishtar Music',
  ],
  ['e-1xmmEb49I', 'To Chalun', 'Roopkumar Rathod (Official)'],
  [
    '7-ORLGKcnLQ',
    "Tumhein Dekhen Meri Aankhen | Divya Bharti | Kumar Sanu | Alka Yagnik | Rang Song | 90's Sad Song",
    'Tips Official',
  ],
  [
    'tPNwGuu_rQ4',
    'Lyrical: Tumhein Apna Banane Ki Kasam | Sadak | Kumar Sanu,Anuradha Paudwal |Sanjay Dutt,Pooja Bhatt',
    'T-Series Bollywood Classics',
  ],
  [
    'dDR4oiyjUBA',
    'Raah Mein Unse Mulaqat - Lyrical | Ajay Devgn, Tabu | Kumar Sanu, Alka Yagnik |Vijaypath | Anu Malik',
    'Tips Official',
  ],
  [
    'tRMzF4EVPHI',
    'Tu Jo Hans Hans Ke HD | Govinda, Aarti Chabria |Udit Narayan, Kavita Krishnamurthy |Raja Bhaiya Song',
    'Goldmines Gaane Sune Ansune',
  ],
  [
    'PqiddY3o3aY',
    'Dil Kehta Hai | Akele Hum Akele Tum | Kumar Sanu, Alka Yagnik | Aamir Khan | 90s Love Song',
    'Ishtar Music',
  ],
  [
    'Jtg2zyS_y_c',
    'Ae Kash Ke Hum Full Video - Kabhi Haan Kabhi Naa | Shah Rukh Khan, Suchitra | Kumar Sanu',
    'SonyMusicIndiaVEVO',
  ],
  [
    'lFdSi01tpYM',
    "Sochenge Tumhe Pyar- Lyrical | #Deewana | #RishiKapoor, Divya Bharti | 90's Best Song",
    'Ishtar Music',
  ],
  [
    'i1IsLVz6T9Q',
    'Kumar Sanu & Sadhana Sargam Live Sydney - Teri umeed tera intezar - Deewana',
    'Chintan Ramola',
  ],
  [
    'bga_0ziOOfQ',
    'Woh Meri Neend Mera Chain Lyrical - Hum Hain Rahi Pyar Ke | Aamir Khan, Juhi Chawla | Sadhana Sargam',
    'Tips Official',
  ],
  [
    'g3ddCx2Uawo',
    'Dil Hai Ki Manta Nahin Full Audio Song (Female Version) | Anuradha Paudwal | Aamir Khan, Pooja Bhatt',
    'T-Series Bollywood Classics',
  ],
  [
    'QjqKXFGM3eI',
    "Chori Chori Dil Tera (HD) - Kumar Sanu Songs - Romantic Songs - 90's Love Song",
    'Shemaroo Filmi Gaane',
  ],
  [
    'Y-o8NQ8Y36A',
    'Is Tarah Aashiqui Ka Lyrical | Imtihan | Kumar Sanu | Saif Ali Khan, Raveena Tandon | Anu Malik',
    'Tips Official',
  ],
  [
    'qGOTe3KmCdY',
    'Kitna Haseen Chehra Full Lyrical Video Song | Dilwale | Ajay Devgan, Raveena Tandon | Kumar Sanu',
    'Ishtar Music',
  ],
  [
    '9f6GhUb-WdM',
    "Dil Cheer Ke Dekh | Divya Bharti | Kamal Sadanah | Kumar Sanu | Rang Movie | 90's Romantic Song",
    'Tips Official',
  ],
  [
    'E4HtYArLiwc',
    "Pucho Zara Pucho | Aamir Khan,Karisma Kapoor | Alka Yagnik,Kumar Sanu | Raja Hindustani | 90's Hit",
    'Tips Official',
  ],
  [
    'd5ZrSe1eDDU',
    'Woh Ladki Bahut Yaad Aati Hai - Kumar Sanu | Qayamat | Best Hindi Song',
    'Madhur Sangeet',
  ],
  [
    '1jjDs69WWUQ',
    'Lal Dupatta Full Song | Mujhse Shaadi Karogi | Salman Khan,Priyanka Chopra |Alka Yagnik,Udit Narayan',
    'T-Series',
  ],
  [
    'PlN6oP-Nlno',
    "Sona Kitna Sona Hai | Govinda, Karisma Kapoor | Udit N & Poornima | Hero No.1 | 90's Hits",
    'Tips Official',
  ],
  ['SF_cCyz6QQg', 'Humko Deewana Kar Gaye [Full Song] Humko Deewana Kar Gaye', 'T-Series'],
  [
    '_YjSmLlmqLM',
    'Aisi Deewangi - Lyrical Video | Deewana | Shahrukh Khan | Divya Bharti | Ishtar Music',
    'Ishtar Music',
  ],
  [
    'qkZiKkmaBtE',
    'आते जाते खूबसूरत आवारा सड़को पे Aate Jate Khoobsurat Awara - किशोर कुमार - अनुरोध - राजेश खन्ना  song',
    'Gaane Naye Purane',
  ],
  [
    'eVnG_Rqfgg4',
    'Neele Neele Ambar Par - Male Version Lyric Video - Kalaakaar | Sridevi | Kishore Kumar',
    'SonyMusicIndiaVEVO',
  ],
  [
    'mW4WRtL6GxM',
    'Is Pyar Se Meri Taraf Na Dekho - Lyrical | Sharukh K, Urmila M | Alka Y, Kumar S | Chamatkar Movie',
    'Tips Official',
  ],
  [
    'wuLJtA0uJro',
    'Hum Lakh Chupaye Pyar Magar | 4K Video Song | Jaan Tere Naam - Kumar Sanu, Asha Bhosle',
    'Ultra Bollywood',
  ],
  [
    'uIOrAkrjwp4',
    'Hum Yaar Hai Tumhare | Alka Yagnik | Udit Narayan | Haan Maine Bhi Pyaar Kiya (2002)',
    'Bollywood Sadabahar',
  ],
  [
    '5y_TCKNzAMI',
    'Tumse Milne Ko Dil Karta Hai ❤️🎶 | Phool Aur Kaante | Ajay Devgn & Madhoo | Kumar Sanu, Alka Yagnik',
    'Zee Music Classic',
  ],
  ['cBwl6qKrZd0', 'Ab Tere Dil Mein To - Kumar Sanu & Alka - Aarzoo', 'Likable Songs'],
  ['BaAoZA0fup0', 'Dil Ka Aalam (Full Song) | Aashiqui | Kumar Sanu | T-Series', 'T-Series'],
  [
    'nNhv8A_rJTg',
    'Oye Raju Pyar Na Kariyo Lyrical Video |Hadh Kar Di Aapne|Anand Bakshi|Anand Raj Anand|Govinda,Rani M',
    'T-Series Bollywood Classics',
  ],
  [
    's1NLjpj3aP4',
    "Jaa Bewafa Jaa Full Video Song - Altaf Raja | Best 90's Hindi Song",
    'Ishtar Music',
  ],
  ['u4NSsEIny1c', 'Muje Pine ka Shauk Nahi - Coolie (1983) Full VIdeo Song *HD*', 'Bolly HD Songs'],
  [
    'RjJxWRFfG3s',
    'Nahin Yeh Ho Nahin Sakta -Lyrical | Bobby Deol, Twinkle Khanna | Kumar Sanu, Sadhana Sargam| Barsaat',
    'Tips Official',
  ],
  [
    'rrzSZ0NMID4',
    'Barsaat Ke Mausam Mein | Naajayaz | Naseeruddin Shah | Kumar Sanu | Roop Kumar Rathod',
    'Bollywood Hits',
  ],
  [
    '1ziaNhD9xqE',
    'Meri Mehbooba Lyrical - Pardes | Shahrukh Khan & Mahima | Kumar Sanu & Alka Yagnik | Shahrukh Hits',
    'Tips Official',
  ],
  [
    'UCsW7nea7sI',
    "Ae Mere Humsafar - 4K Video | Shah Rukh Khan & Shilpa Shetty | Baazigar | 90's Hindi Romantic Song",
    'Ishtar Music',
  ],
  [
    '5dWbn_qER3s',
    'Tere Dar Par Sanam - Male Version - Phir Teri Kahani Yaad Aayee | Kumar Sanu | Rahul Roy',
    'Zee Music Classic',
  ],
  [
    'HIr_kpG4Fnc',
    'S. P. Balasubrahmanyam sings Tumse Milne Ki Tamanna Hai - तुमसे मिलने की तमन्ना from Saajan (1991)',
    'Hemantkumar Mahale',
  ],
  ['XR7qvTgQ19o', 'Taaron Ka Chamakta [Full Song] Hum Tumhare Hain Sanam', 'T-Series'],
  [
    'jEL02Nz7Dds',
    'Dono Hi Mohabbat Ke Full Video Song | Altaf Raja | Best Hindi Romantic Songs | Hindi Album Songs',
    'Ishtar Music',
  ],
  [
    'mocKoIhNJxk',
    'Ding Dong Dole Lyrical Video | Kucch To Hai | K K, Sunidhi Chauhan | Tushar Kapoor, Natassha',
    'T-Series Bollywood Classics',
  ],
  ['Tx7YCSTJC6I', 'Dheere Dheere [Full Song] Tere Bina', 'T-Series'],
  [
    'jD3SGW0NHY0',
    "Kumar Sanu 90's Hits | Chand Se Parda Kijiye | Aao Pyar Karen [1994] | Saif Ali Khan & Shilpa Shetty",
    'Shemaroo Filmi Gaane',
  ],
  [
    '0A2ue4lNMzo',
    'Wafa Na Raas Aayee Tujhe O Harjaee Full Video | Bewafa Sanam | Krishan Kumar |  Nitin Mukesh',
    'T-Series',
  ],
  [
    's4slgbuwOfw',
    'O Dil Tod Ke Hansti Ho Mera Remix Video Song | Bewafa Sanam | Kishan Kumar | Udit Narayan',
    'Pop Chartbusters',
  ],
];

/** "banger songs that play at indian barber shops" — 62 tracks. */
const SALOON_SNAPSHOT: readonly SnapshotRow[] = [
  [
    'N0jnLZxYwYc',
    'Mujhse Mohabbat Ka Izhaar (HD)| Hum Hain Rahi Pyar Ke (1993)| Aamir Khan| Juhi Chawla| Romantic Song',
    'Shemaroo Filmi Gaane',
  ],
  [
    '3NWMK2MRqIk',
    'Tumsa Koi Pyaara | Khuddar | Govinda, Karisma Kapoor | Kumar Sanu, Alka Yagnik |Anu Malik, 90s Hits',
    'Tips Official',
  ],
  [
    'bga_0ziOOfQ',
    'Woh Meri Neend Mera Chain Lyrical - Hum Hain Rahi Pyar Ke | Aamir Khan, Juhi Chawla | Sadhana Sargam',
    'Tips Official',
  ],
  [
    'oFxbBeYhLqM',
    'Saaton Janam Main Tere Full Lyrical |Video Song | Dilwale | Ajay Devgan, Raveena Tandon | Kumar Sanu',
    'Ishtar Music',
  ],
  [
    'nNhv8A_rJTg',
    'Oye Raju Pyar Na Kariyo Lyrical Video |Hadh Kar Di Aapne|Anand Bakshi|Anand Raj Anand|Govinda,Rani M',
    'T-Series Bollywood Classics',
  ],
  [
    'd3lZvNexPL0',
    'Bahut Pyar Karte Hain (Male) [Full Song] (HQ) W/ Lyrics + English Translation - Saajan',
    'thebollysongs8',
  ],
  [
    'CTuvMubzXpU',
    'Jeeta Tha Jiske Liye Full Lyrical Video Song | Dilwale | Ajay Devgan, Raveena Tandon |',
    'Ishtar Music',
  ],
  [
    'i1IsLVz6T9Q',
    'Kumar Sanu & Sadhana Sargam Live Sydney - Teri umeed tera intezar - Deewana',
    'Chintan Ramola',
  ],
  [
    '5y_TCKNzAMI',
    'Tumse Milne Ko Dil Karta Hai ❤️🎶 | Phool Aur Kaante | Ajay Devgn & Madhoo | Kumar Sanu, Alka Yagnik',
    'Zee Music Classic',
  ],
  [
    'fBylcT-TWZw',
    '"Bas Ek Sanam Chahiye Aashiqui Ke Liye" Lyrical Video | Aashiqui | Kumar Sanu | Rahul R, Anu Agarwal',
    'T-Series Bollywood Classics',
  ],
  [
    'CTNgz5gb3D8',
    'TU PYAR HAI KISI AUR KA ( Singers, Babla Mehta & Anuradha Paudwal )',
    'Swati Channel',
  ],
  [
    'lFdSi01tpYM',
    "Sochenge Tumhe Pyar- Lyrical | #Deewana | #RishiKapoor, Divya Bharti | 90's Best Song",
    'Ishtar Music',
  ],
  [
    'dDR4oiyjUBA',
    'Raah Mein Unse Mulaqat - Lyrical | Ajay Devgn, Tabu | Kumar Sanu, Alka Yagnik |Vijaypath | Anu Malik',
    'Tips Official',
  ],
  [
    'otQmzlm-s7Q',
    'Main Duniya Bhula Doonga - Lyrical Video Song || Aashiqui | Kumar Sanu | Rahul Roy, Anu Agarwal',
    'T-Series Bollywood Classics',
  ],
  [
    'tPNwGuu_rQ4',
    'Lyrical: Tumhein Apna Banane Ki Kasam | Sadak | Kumar Sanu,Anuradha Paudwal |Sanjay Dutt,Pooja Bhatt',
    'T-Series Bollywood Classics',
  ],
  [
    'p1jhKCIoVjI',
    'Tum dil ki dhakdan mein rehete ho - abhijeet bhattacharya | unplugged | 90+ million',
    '90+ million',
  ],
  ['2OsyNo53MzU', 'Ustad Nusrat Fateh Ali Khan - Dulhe Ka Sehra Suhana in HD', 'tgdproduction10'],
  [
    '-N-k56i7M2k',
    'Maine Pyaar Tumhi Se Kiya Hai Lyrical- Phool Aur Kaante | Ajay Devgn & Madhoo | Anuradha & Kumar',
    'Tips Official',
  ],
  [
    'rXHY4Cv9cA8',
    'Ab Tere Bin Jee Lenge Hum Lyrical Video | Aashiqui | Kumar Sanu | Sameer | Anu Agarwal, Rahul Roy',
    'T-Series Bollywood Classics',
  ],
  [
    'qGOTe3KmCdY',
    'Kitna Haseen Chehra Full Lyrical Video Song | Dilwale | Ajay Devgan, Raveena Tandon | Kumar Sanu',
    'Ishtar Music',
  ],
  ['cGKBs7rokos', 'Tujhko Na Dekhu Toh (Jaanwar) Sunidhi Chauhan, Udit Narayan', 'Sunidhi Songs'],
  [
    'BtdiNnrftYM',
    "Chand Tare Phool - 4K Video | Tum Se Achcha Kaun Hai | Nakul Kapoor | 90's Best Romantic Songs",
    'Ishtar Music',
  ],
  [
    'nRJ8vHpi6_g',
    'Tum Dil Ki Dhadkan Mein - VIDEO | Suniel Shetty | Dhadkan | Singer : Kumar Sanu | Romantic Song',
    'Ishtar Music',
  ],
  [
    'xKx_80QM2LU',
    'Sab Kuchh Bhula Diya Lyrical Video | Hum Tumhare Hain Sanam | Sonu N,Sapna A|Shahrukh Khan,Madhuri D',
    'T-Series Bollywood Classics',
  ],
  [
    'zuPoUsdXrqM',
    'Dheere Dheere Pyar Ko Badhana Hai | Phool Aur Kaante | Kumar Sanu, Alka Yagnik | Ajay Devgn & Madhoo',
    'Zee Music Classic',
  ],
  [
    'wYdXuNtJkPk',
    "Jeeye To Jeeye Kaise -Lyrical | Saajan | Pankaj Udhas | Salman Khan & Madhuri | 90's Hindi Sad Songs",
    'Ishtar Music',
  ],
  [
    'wuLJtA0uJro',
    'Hum Lakh Chupaye Pyar Magar | 4K Video Song | Jaan Tere Naam - Kumar Sanu, Asha Bhosle',
    'Ultra Bollywood',
  ],
  [
    'RjJxWRFfG3s',
    'Nahin Yeh Ho Nahin Sakta -Lyrical | Bobby Deol, Twinkle Khanna | Kumar Sanu, Sadhana Sargam| Barsaat',
    'Tips Official',
  ],
  [
    'wV8njoRVefQ',
    "Kitna Pyaara Tujhe Rabne Banaya | Raja Hindustani | Alka Yagnik, Udit Narayan | 90's Hits",
    'Tips Official',
  ],
  ['4ImdbyqnH8w', 'Hum Pyaar Hai Tumhare', 'The Kumar Sanu Official'],
  [
    'htMvfOfixuM',
    'Ek Ladki Ko Dekha | एक लडकी को देखा | 1942 A love story | Kumar Sanu | Anil Kapoor | Manisha Koirala',
    'Saregama Music',
  ],
  [
    '5dWbn_qER3s',
    'Tere Dar Par Sanam - Male Version - Phir Teri Kahani Yaad Aayee | Kumar Sanu | Rahul Roy',
    'Zee Music Classic',
  ],
  ['6Na7GSV9bVY', 'Chura Ke Dil Mera - JHANKAR BEATS | | Akshay & Shilpa', 'Ishtar Music'],
  [
    'oEg_iXEWlt4',
    'Lyrical : Tu Meri Zindagi Hai | Aashiqui | Anuradha Paudwal, Kumar Sanu |Rahul Roy, Anu Agarwal',
    'T-Series Bollywood Classics',
  ],
  [
    'QjqKXFGM3eI',
    "Chori Chori Dil Tera (HD) - Kumar Sanu Songs - Romantic Songs - 90's Love Song",
    'Shemaroo Filmi Gaane',
  ],
  [
    'Dz1Ad3cdtQA',
    'Ek Aisi Ladki Thi Jise Mai Pyar Karta Tha...      Kumar Sanu and Alka Yagnik ...  Nadeem Shravan.flv',
    'Asim Ghulam',
  ],
  [
    'G7AdjVDBLO8',
    'Achha Sila Diya Toone Mere Pyar Ka Full Video | Bewafa Sanam | Krishan Kumar, Shilpa S | Sonu Nigam',
    'T-Series',
  ],
  ['TgHYW8ubFko', 'Tere Dard Se Dil (Jhankar Beats)', 'The Kumar Sanu Official'],
  [
    'uIOrAkrjwp4',
    'Hum Yaar Hai Tumhare | Alka Yagnik | Udit Narayan | Haan Maine Bhi Pyaar Kiya (2002)',
    'Bollywood Sadabahar',
  ],
  [
    'HoMSu1iw0Zw',
    'Aitbaar Nahi Karna - Abhijeet Bhattacharya | Qayamat | Best Hindi Song',
    'Madhur Sangeet',
  ],
  [
    'WAgJ8KM5AVQ',
    'Dekha Hai Pehli Baar -| Saajan | Alka Yagnik Live Performance',
    'Ashirbad Studio Official',
  ],
  [
    'OgocnLh9P1M',
    'Aankh Hai Bhari Bhari (Male)  | Tum Se Achcha Kaun Hai | Ishtar Music #bollywood',
    'Ishtar Music',
  ],
  ['Zi9UBJQMz3I', 'Kya Karte They Sajna [Full Song] Phir Lehraya Lal Dupatta', 'T-Series'],
  [
    '_dUAVM5ERXA',
    'देखने वालों ने क्या-क्या | Dekhne Waalon Ne | Chori Chori Chupke Chupke | Udit Narayan | Alka Yagnik',
    'Shemaroo Filmi Gaane',
  ],
  [
    'lRBIcaSV-Ns',
    'Tum To Thehre Pardesi | Altaf Raja | Hindi Album Songs | Video Jukebox - #RomanticSong',
    'Ishtar Music',
  ],
  [
    '9v2bq2JHt4I',
    'Chehra Kya Dekhte Ho - Kumar Sanu | Asha Bhosle | Romantic Song| Kumar Sanu Hits Songs',
    'Madhur Sangeet',
  ],
  ['Gg9ZUppafLo', 'Too Shayar Hai Main Teri Shayari - Saajan Alka Yagnik.', 'IDeal Music'],
  [
    'w89fWEelFns',
    "Paas Woh Aane Lage | Main Khiladi Tu Anari | Kumar Sanu & Alka Yagnik | 90's Hindi Songs",
    'Ishtar Music',
  ],
  [
    'fg9G1dacXjk',
    'Chhupana Bhi Nahin Aata Full Video Song | Baazigar | Shahrukh Khan, Kajol | Vinod Rathod',
    'Venus Movies',
  ],
  [
    'Y-o8NQ8Y36A',
    'Is Tarah Aashiqui Ka Lyrical | Imtihan | Kumar Sanu | Saif Ali Khan, Raveena Tandon | Anu Malik',
    'Tips Official',
  ],
  [
    '526hvVlBP1U',
    'Tumse Milna Lyrical Video | Tere Naam | Himesh Reshammiya | Salman Khan, Bhoomika Chawla',
    'T-Series Bollywood Classics',
  ],
  [
    'iCZfjggJg3M',
    'Kyo Kisi Ko (Video Song)| Tere Naam | Salman Khan, Bhumika Chawla  |Udit Narayan, Himesh Reshammiya',
    'T-Series',
  ],
  ['BaAoZA0fup0', 'Dil Ka Aalam (Full Song) | Aashiqui | Kumar Sanu | T-Series', 'T-Series'],
  [
    'cBGDDBHN22U',
    'Pehli Pehli Baar Mohabbat Ki Hai Full Video Song | Sirf Tum|Kumar Sanu,Alka Yagnik|Sanjay K, Priya G',
    'T-Series Bollywood Classics',
  ],
  [
    'nG85YFR3o6U',
    'तूने दिल मेरा तोड़ा | Tune Dil Mera Toda Kahi | Sanam Bewafa (1990) | Lata Mangeshkar | 90s Sad Song',
    'Shemaroo Filmi Gaane',
  ],
  [
    'TRUuSFW80Rk',
    'Kaash Kahin Aisa Hota - LYRICAL | Akshay Kumar & Raveena Tandon | Mohra | 90s Best Romantic Sad Song',
    'Ishtar Music',
  ],
  ['-pIMyf5dOnA', 'Aawara Hawa Ka Jhonka Hoon  Song - Altaf Raja', 'Ishtar Music'],
  [
    'GxaTSDnI71w',
    'Love Tujhe Love Main Karta Hoon | Teri Adaaon Pe Marta Hoon ❤️| Kumar Sanu | Alka Y | Barsaat | 1995',
    'Bollywood Dhamaka',
  ],
  [
    'XWKazQwFFdY',
    'Tere Dard Se Dil Aabad Raha  | Deewana Movie | Shahrukh Khan | Rishi Kapoor | Divya Bharti',
    'Shemaroo Musical Maestros',
  ],
  [
    '9f6GhUb-WdM',
    "Dil Cheer Ke Dekh | Divya Bharti | Kamal Sadanah | Kumar Sanu | Rang Movie | 90's Romantic Song",
    'Tips Official',
  ],
  [
    'rMbQufI9xQw',
    'Premi Aashiq Aawaara - Phool Aur Kaante | Kumar Sanu | Ajay Devgn & Madhoo',
    'Zee Music Classic',
  ],
  ['Mfeg92XPXik', 'Dil Diwana (Duet)', 'Anuradha Paudwal Official'],
];

/**
 * "Best of Emraan Hashmi" — the 12 songs listed in the compilation at
 * `EMRAAN_SOURCE_URL`, sourced one video per song.
 *
 * That upload is a single hour-long video, which would be one unskippable
 * "track" here and has no counterpart in Apple's catalogue for ad-free mode. So
 * each song points at its own official upload instead, chosen so that the
 * cleaned title still matches the recording — "Bheege Honth Tere" reads better
 * than the row below, but the only Apple result under that spelling is a
 * karaoke version.
 */
const EMRAAN_SNAPSHOT: readonly SnapshotRow[] = [
  [
    'ZsAOnmByy38',
    'Zara Sa | 4K Music Video | Jannat | Emraan Hashmi | Sonal Chauhan | KK | Pritam | Sayeed Quadri',
    'Sony Music India',
  ],
  ['zZ1L9srWhco', 'Bheegey Hont (With Dialogue)', 'Anu Malik - Topic'],
  ['cGNcjqXe87U', 'Tu Hi Meri Shab Hai', 'Pritam - Topic'],
  [
    'p4fxIdy7ndw',
    'Pee Loon - Video Song | Mohit Chauhan | Once Upon A Time in Mumbai | Pritam | Emraan Hashmi, Prachi',
    'T-Series Bollywood Classics',
  ],
  [
    'sVRwZEkXepg',
    'Hamari Adhuri Kahani - Lyrical Song | Arjit Singh | Emraan Hashmi, Vidya Balan | Jeet Gannguli',
    'Sony Music India',
  ],
  ['3O6eYd8pUM8', 'Deewana kar Raha Hai Lyrical | Raaz 3 | Emraan Hashmi, Esha Gupta', 'T-Series'],
  [
    '3QhajVg6SjE',
    'Tu Hi Haqeeqat - Lyrical Song | Tum Mile | Emraan Hashmi | Soha Ali Khan | Javed Ali | Pritam',
    'Sony Music India',
  ],
  [
    'xzUVPN68Ym4',
    'Dil Ibaadat | Tum Mile | KK | Emraan Hashmi | Soha Ali Khan | Pritam | Sayeed Quadri | 4K',
    'Sony Music India',
  ],
  [
    'V1fbOsHBlZE',
    'Haan Tu Hain - Full Video | Jannat | Emraan Hashmi, Sonal Chauhan | KK | Pritam | Sayeed Quadri',
    'Sony Music India',
  ],
  [
    'sSFM_hCFgko',
    'Judai - Full Video | Emraan Hashmi | Sonal Chauhan | Kamran Ahmed | Pritam | Jannat',
    'Sony Music India',
  ],
  [
    'e1edxTqJnKk',
    'Maahi - Full Video | Kangana Ranaut, Emraan Hashmi | Toshi & Sharib Sabri | Mohit Suri | Raaz 2',
    'Sony Music India',
  ],
  [
    'cZBFVrp3qgw',
    '💭 Tujhe Sochta Hoon 4K Video | Jannat 2 | Emraan Hashmi | Esha Gupta | KK | Pritam | Sayeed Quadri 🌙',
    'Sony Music India',
  ],
];

export const PLAYLISTS: readonly Playlist[] = [
  {
    id: 'safar',
    name: 'Safar',
    wordmark: 'सफ़र',
    youTubeUrl: youTubeUrl(SAFAR_PLAYLIST_ID),
    source: { kind: 'youtube', playlistId: SAFAR_PLAYLIST_ID, tracks: toTracks(SAFAR_SNAPSHOT) },
  },
  {
    id: 'bus-drive',
    name: 'Bus Drive',
    wordmark: 'बस ड्राइव',
    youTubeUrl: youTubeUrl(BUS_DRIVE_PLAYLIST_ID),
    source: {
      kind: 'youtube',
      playlistId: BUS_DRIVE_PLAYLIST_ID,
      tracks: toTracks(BUS_DRIVE_SNAPSHOT),
    },
  },
  {
    id: 'saloon',
    name: 'Saloon',
    wordmark: 'सैलून',
    youTubeUrl: youTubeUrl(SALOON_PLAYLIST_ID),
    source: {
      kind: 'youtube',
      playlistId: SALOON_PLAYLIST_ID,
      tracks: toTracks(SALOON_SNAPSHOT),
    },
  },
  {
    id: 'emraan',
    name: 'Emraan',
    wordmark: 'इमरान',
    // No playlist to link: the badge points at the compilation this came from.
    youTubeUrl: EMRAAN_SOURCE_URL,
    source: { kind: 'youtube', tracks: toTracks(EMRAAN_SNAPSHOT) },
  },
];

export const DEFAULT_PLAYLIST_ID: PlaylistId = 'safar';
