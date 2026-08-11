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

export type PlaylistId = 'safar' | 'bus-drive' | 'saloon' | 'emraan' | 'awarapan' | 'rohan';

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
export const AWARAPAN_PLAYLIST_ID = 'PLHuHXHyLu7BGiVIV7r3FC5s7ZZB7hG7_O';

/** The "Best of Emraan Hashmi" compilation the Emraan section was built from. */
export const EMRAAN_SOURCE_URL = 'https://music.youtube.com/watch?v=7AWIrVanz0w';

/** The KK jukebox the Rohan section plays, whole and unsplit. */
export const ROHAN_SOURCE_URL = 'https://music.youtube.com/watch?v=r0c1f6XxRQg';

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

/** "Top Emraan Hashmi Love Songs" — 84 tracks. */
const AWARAPAN_SNAPSHOT: readonly SnapshotRow[] = [
  [
    'n_VrRuNkbrE',
    'Toh Phir Aao - 8K/4K Music Video | Awarapan | Emraan Hashmi Song | Mustafa Zahid | Pritam',
    'Sony Music India',
  ],
  [
    'HX1EXb5kWwY',
    'Ve Junoon | Awarapan 2 | Emraan Hashmi, Disha Patani | Vishesh Bhatt | Mithoon, Sayeed Q., Subodhh',
    'Sony Music India and Vishesh Films',
  ],
  [
    'g23pmazHwgE',
    'Tera Mera Rishta Purana - 8K/4K Music Video | Awarapan | Emraan Hashmi Song | Mustafa Zahid | Pritam',
    'Sony Music India',
  ],
  [
    'dnND99uRz5o',
    'Haan Tu Hain - 8K/4K Music Video | Emraan Hashmi, Sonal Chauhan | KK | Pritam | Jannat',
    'Sony Music India',
  ],
  [
    'ktPD6TMovxs',
    'Humnava - Full Video | Hamari Adhuri Kahani | Emraan Hashmi, Vidya Balan | Papon | Mithoon',
    'Sony Music India',
  ],
  [
    'o8dOljHt_mU',
    'Pritam, A.R. Rahman, Mohit Chauhan - Rab Ka Shukrana (Full Song Video)',
    'SonyMusicIndiaVEVO',
  ],
  [
    'i_HFdi1xxFM',
    'Tera Deedar Hua - Full Song | Emraan Hashmi | Esha Gupta | Pritam | Javed Ali',
    'SonyMusicIndiaVEVO',
  ],
  [
    '-7_MyOao-eE',
    'Tu Hi Haqeeqat Lyric Video - Tum Mile|Emraan Hashmi,Soha Ali Khan|Pritam|Javed Ali|Shadab',
    'Sony Music India',
  ],
  [
    'yBa3FVQKAvY',
    'Tu Hi Mera - Full Video | Emraan Hashmi, Esha Gupta | Jannat 2 | Shafqat Amanat Ali | Pritam',
    'SonyMusicIndiaVEVO',
  ],
  [
    'pX5m9gN7Z60',
    'Kya Full Video - Crook|Emraan Hashmi, Neha|Neeraj Shridhar|Pritam|Mohit Suri,Mukesh Bhatt',
    'SonyMusicIndiaVEVO',
  ],
  [
    'uqF-Rt8tcpg',
    "Mere Bina Lyric Video - Crook | Emraan Hashmi, Neha | Nikhil D'Souza | Pritam | Mukesh Bhatt",
    'SonyMusicIndiaVEVO',
  ],
  [
    'MJDIDTb2Zwk',
    'Kya Lyric Video - Crook|Emraan Hashmi,Neha|Neeraj Shridhar|Pritam|Mohit Suri,Mukesh Bhatt',
    'SonyMusicIndiaVEVO',
  ],
  [
    'mbGNF4QXaEE',
    'Yaaram Full Video - Ek Thi Daayan|Emraan, Kalki, Huma|Sunidhi Chauhan, Clinton Cerejo',
    'SonyMusicIndiaVEVO',
  ],
  [
    '853l2HVY-AM',
    'Pakeezah Video Edit - Ungli|Emraan Hashmi|Kangna Ranaut|Gulraj Singh|Karan Johar',
    'SonyMusicIndiaVEVO',
  ],
  [
    'f3FFOBrMmdg',
    'Humari Adhuri Kahani - Full Song | Arijit Singh | Emraan Hashmi, Vidya Balan | Jeet Gannguli',
    'Sony Music India',
  ],
  [
    'oyaudgo5_8Y',
    'Hasi Full Video, Ami Mishra - Hamari Adhuri Kahani | Emraan Hashmi, Vidya Balan | Mohit Suri',
    'Sony Music India',
  ],
  [
    '705E59Lrcos',
    'Yeh Kaisi Jagah Full Video - Hamari Adhuri Kahani|Emraan Hashmi,Vidya Balan|Deepali Sathe',
    'SonyMusicIndiaVEVO',
  ],
  [
    'F-co5-9hZjg',
    'Teri Khushboo - Arijit Singh | Emraan Hashmi, Amyra | Jeet Gannguli | Mr. X',
    'SonyMusicIndiaVEVO',
  ],
  [
    'dFCFAhAONgk',
    'Tu Jo Hain Full Video - Mr. X | Emraan Hashmi, Amyra Dastur | Ankit Tiwari | Monish Raza',
    'SonyMusicIndiaVEVO',
  ],
  [
    'UeaO8uEXp0c',
    'Rab Ka Shukrana | Jannat 2 | Emraan Hashmi, Esha Gupta | Mohit Chauhan | Pritam | Romantic songs',
    'Sony Music India',
  ],
  [
    'ybFC4Gx-FlM',
    'Dekhha Tenu | Tu Hain Toh | Rajkummar Rao | Janhvi Kapoor | Mr. & Mrs. Mahi | Video Jukebox',
    'Sony Music India',
  ],
  [
    '8_uNrBN3f2Q',
    'Best of Emraan Hashmi | Tu Hi Haqeeqat | Zara Sa | Mere Bina | Maahi | Soniyo | Top 15 Love Songs',
    'Sony Music India',
  ],
  [
    '3QhajVg6SjE',
    'Tu Hi Haqeeqat - Lyrical Song | Tum Mile | Emraan Hashmi | Soha Ali Khan | Javed Ali | Pritam',
    'Sony Music India',
  ],
  [
    'VfRd8NI944E',
    'Lazy Lad - Lyrical Video | Ghanchakkar | Emraan Hashmi | Vidya Balan | Richa Sharma | Amit Trivedi',
    'Sony Music India',
  ],
  [
    'U2QNhsAgIIE',
    'KK | Dil Ibaadat Kar Raha Hai (Lyrical Video) | Emraan Hashmi | Soha Ali Khan | Pritam | Tum Mile',
    'Sony Music India',
  ],
  [
    'FOkVXadnO88',
    'Hasi Ban Gaye (Lyrical Video) Male Version | Emraan Hashmi, Vidya Balan | Ami Mishra | Mohit Suri',
    'Sony Music India',
  ],
  [
    'APfqfKHdgpQ',
    'KK | Haan Tu Hain (Lyrical Video) | Emraan Hashmi | Jannat | Sonal Chauhan | Pritam | Sayeed Quadri',
    'Sony Music India',
  ],
  [
    'mfNnCKMx-tk',
    'Tu Hi Mera - Audio Lyrical | Emraan Hashmi, Esha Gupta | Jannat 2 | Shafqat Amanat Ali | Pritam',
    'Sony Music India',
  ],
  [
    'G-CBwdL4pZU',
    'Maahi - 8K/4K Music Video | Emraan Hashmi | Kangana Ranaut | Raaz 2 | Shaarib Toshi',
    'Sony Music India',
  ],
  [
    'sVRwZEkXepg',
    'Hamari Adhuri Kahani - Lyrical Song | Arjit Singh | Emraan Hashmi, Vidya Balan | Jeet Gannguli',
    'Sony Music India',
  ],
  [
    'bYxI4GeVuOc',
    'Jannatein Kahan - Lyrical Song | Jannat 2 | Emraan Hashmi, Esha Gupta | Pritam | KK Superhit Song',
    'Sony Music India',
  ],
  [
    'eaylDzP0NPg',
    "Mere Bina - Audio Lyrical | Emraan Hashmi, Neha Sharma | Nikhil D'Souza | Pritam | Crook",
    'Sony Music India',
  ],
  [
    '4XRpFXy-TwU',
    'Alif Se - Lyrical Video | Mr. X | Gurmeet C, Emraan Hashmi, Nora Fatehi | Ankit Tiwari, Neeti Mohan',
    'Sony Music India',
  ],
  [
    '5wIXDjtv1fE',
    'Yaaram - Lyrical Video | Ek Thi Daayan | Emraan Hashmi, Kalki, Huma | Sunidhi Chauhan & Clinton C',
    'Sony Music India',
  ],
  [
    'Hm02o6YgYS4',
    'Pakeezah - Audio Lyrical | Emraan Hashmi | Kangna Ranaut | Ungli | Gulraj Singh | Love Song',
    'Sony Music India',
  ],
  [
    'S6Gdnxtw9rM',
    'O Jaana - Lyrical Video | KK | Kangana Ranaut, Adhyayan Suman, Emraan Hashmi | Raju Singh',
    'Sony Music India',
  ],
  [
    '_n0RaYlS06Q',
    'Emraan Hashmi Romantic Songs Mashup | Best Of Emraan Hashmi | Dj Raahul Pai & Dj Saquib',
    'Sony Music India',
  ],
  [
    'Zheks4f_afI',
    'Tu Jo Hain - Lyrical Video | Mr. X | Emraan Hashmi, Amyra Dastur | Ankit Tiwari | Romantic Hit Song',
    'Sony Music India',
  ],
  [
    'BQSMgvwrilI',
    'Tera Deedar Hua - Lyrical Song | Emraan Hashmi, Esha | Jannat 2 | Javed Ali | Rahat Fateh Ali Khan',
    'Sony Music India',
  ],
  [
    '2SsbXS1IM6I',
    'Yeh Kaisi Jagah - Lyrical Song | Emraan Hashmi, Vidya Balan | Hamari Adhuri Kahani | Deepali Sathe',
    'Sony Music India',
  ],
  [
    'nF4RAgy6Jkk',
    'KK | Dil Ibaadat - Rock Version (Lyrical Video) | Emraan Hashmi | Soha Ali Khan | Pritam | Tum Mile',
    'Sony Music India',
  ],
  [
    '7fjaLJu4BrE',
    'Judai - Lyrical video | Kamran Ahmed | Emraan Hashmi | Sonal Chauhan | Pritam | Jannat',
    'Sony Music India',
  ],
  [
    '-8C_2BBVWk8',
    'KK | Zara Sa - Audio Lyrical | Emraan Hashmi | Sonal Chauhan | Pritam | Sayeed Quadri | Jannat',
    'Sony Music India',
  ],
  [
    's4JsOMNFZiA',
    "Challa - Lyrical Video | Emraan Hashmi | Neha Sharma | Babbu Mann, Suzanne D'Mello | Pritam | Crook",
    'Sony Music India',
  ],
  [
    'bEt5rbf1Rnc',
    'Kaali Kaali - 8K/4K Music Video | Emraan Hashmi, Huma Qureshi | Ek Thi Daayan | Clinton Cerejo',
    'Sony Music India',
  ],
  [
    'C9GVzvjgmwA',
    'Jannat All Songs - Video Jukebox | Zara sa | Haan tu hai | KK | Emraan Hashmi | Pritam | Love Songs',
    'Sony Music India',
  ],
  [
    'yynPV_JCfNw',
    'Teri Khushboo - 8K/4K Music Video | Arijit Singh | Emraan Hashmi, Amyra | Jeet Gannguli | Mr. X',
    'Sony Music India',
  ],
  [
    'CaEJ5_zdgFg',
    'KK - Kaisa Ye Raaz Hai | Lyrical Video | Emraan Hashmi | Kangana Ranaut | Pranay M. Rijia',
    'Sony Music India',
  ],
  [
    'LF3KvK6U270',
    'Saad Shukrana - 8K/4K Music Video | Mr. X | Emraan Hashmi, Amyra Dastur | Ankit Tiwari',
    'Sony Music India',
  ],
  [
    '0_6j1jxCoFw',
    'Tum Mile - Love Reprise | Lyrical Video | Emraan Hashmi | Soha Ali Khan | Javed Ali | Pritam',
    'Sony Music India',
  ],
  [
    'Nl8jRJJIySE',
    'Kya - 8K/4K Music Video | Emraan Hashmi, Neha Sharma | Crook | Neeraj Shridhar | Pritam',
    'Sony Music India',
  ],
  [
    'cxEv8whJhfI',
    'Bollywood Nostalgic Hit Songs | Bollywood Love Songs | 2000s Best Songs | Evergreen Hindi Songs',
    'Sony Music India',
  ],
  [
    'EQ8qW_HStXQ',
    'TOP 20 ICONIC Bollywood Songs | 2 Hours NonStop | Best Hindi Love Songs | Romantic Hindi Hits',
    'Sony Music India',
  ],
  [
    'rfD9RgDg4uE',
    'Hasi - 8K/4K Music Video | Emraan Hashmi, Vidya Balan | Ami Mishra | Hamari Adhuri Kahani',
    'Sony Music India',
  ],
  [
    'q7l0AxOIJ40',
    'Hamari Adhuri Kahani - 8K/4K Music Video | Arjit Singh | Emraan Hashmi, Vidya Balan | Jeet Gannguli',
    'Sony Music India',
  ],
  [
    'nfcufQVUdWo',
    'Tum Mile (Afro House Mix) Emraan Hashmi | Soha Ali Khan | DJ Basque | Neeraj Shridhar | Pritam',
    'Sony Music India',
  ],
  [
    'Hkf-fHeJhH4',
    'KK - O Meri Jaan | Audio Lyrical | Tum Mile | Emraan Hashmi, Soha Ali Khan | Pritam',
    'Sony Music India',
  ],
  [
    'UrDhGWi9hKw',
    'Humnava - 8K/4K Music Video | Emraan Hashmi, Vidya Balan | Hamari Adhuri Kahani | Papon | Mithoon',
    'Sony Music India',
  ],
  [
    'ghstBv1TxJs',
    'Emraan Hashmi Romantic Songs Mashup | DJ Angel | Shaarib Toshi | KK | Pritam',
    'Sony Music India',
  ],
  [
    'qrIr5MYsnfs',
    'Rab Ka Shukrana - Reprise | Lyrical | Emraan Hashmi, Esha Gupta | Anupam Amod | Jannat 2 | Pritam',
    'Sony Music India',
  ],
  [
    'eESg95AqmbA',
    'Jannat - Audio Jukebox | 10 Years of Jannat | Emraan Hashmi | Evergreen Hits',
    'Sony Music India',
  ],
  [
    '7KhG5uAZKTw',
    'Mohit Chauhan - Tujhko Jo Paaya | Video Lyrical | Emraan Hashmi | Neha Sharma | Pritam | Crook',
    'Sony Music India',
  ],
  [
    'JaM5AUsKOSg',
    'Ek Thi Daayan - Audio Jukebox | Emran Hashmi | Yaaram, Kaali Kaali | Evergreen Hindi Songs',
    'Sony Music India',
  ],
  [
    'pGcbthDbU_k',
    'Shreya Ghoshal - Hasi | Audio Lyrical | Emraan Hashmi, Vidya Balan | Hamari Adhuri Kahani',
    'Sony Music India',
  ],
  [
    'Qb3JOTwGcGw',
    'Judai - HD Music Video | Emraan Hashmi | Sonal Chauhan | Pritam | Kamran Ahmed | Jannat | Dekho HD',
    'Sony Music India',
  ],
  [
    'dznJcA5y6gc',
    'Sang Hoon Tere - Lyrical Video | Emraan Hashmi, Esha | Nikhil Dsouza | Pritam Chakraborty | Jannat 2',
    'Sony Music India',
  ],
  [
    'ActXAI00aKU',
    'Auliya – Lyrical Audio | Armaan Malik | Emraan Hashmi, Kangana Ranaut | Ungli',
    'Sony Music India',
  ],
  [
    'kZtOtMj4yp8',
    'RAAZ - The Mystery Continues | Maahi, Soniyo, O Jaana | Audio Jukebox | Emraan Hashmi, Kangana R',
    'Sony Music India',
  ],
  [
    'PJDxZDcQ9ts',
    'Valentine Special 2026 | Superhit Hindi Love Songs | Best of Bollywood Romantic Hits | Audio Jukebox',
    'Sony Music India',
  ],
  [
    'Ky1wwpXVpyk',
    'Best of Emraan Hashmi Songs in 8K | Kya, Haan Tu Hain, Maahi, Hasi, Humnava | Valentine Special',
    'Sony Music India',
  ],
  [
    'bxHPqrp_llE',
    'Emraan Hashmi Superhit Songs | Tum Mile, Tu Hi Mera, Mere Bina, Maahi  | Nostalgic Bollywood Songs',
    'Sony Music India',
  ],
  [
    'a1aE3iHIDhM',
    'Maahi - Audio Lyrical | Emraan Hashmi | Kangana Ranaut | Raaz 2 | Shaarib Toshi',
    'Sony Music India',
  ],
  [
    'rxdMjVyimqE',
    'Tu Jo Hain Toh Main Hoon - 8K/4K Music Video | Emraan Hashmi, Amyra Dastur | Ankit Tiwari | Mr. X',
    'Sony Music India',
  ],
  [
    'R8Q6Up_3lTU',
    'Mr.X All Songs | Tu Jo hai, Alif se, Teri Khushboo | Emraan H, Amyra | Ankit Tiwari | Jeet Gannguli',
    'Sony Music India',
  ],
  [
    't3ZlCLTyP-0',
    'KK - Mat Aazma Re | Audio Lyrical | Randeep Hooda | Aditi Rao | Pritam | Sayeed Quadri | Murder 3',
    'Sony Music India',
  ],
  [
    '_mVxFIp46Bc',
    'Kya - Audio Song | Emraan Hashmi | Neha Sharma | Crook | Neeraj Shridhar | Pritam',
    'Sony Music India',
  ],
  [
    '76bHXlozrZ4',
    'KK | Tujhe Sochta Hoon - 8K/4K Music Video | Emraan Hashmi | Esha Gupta | Pritam | Jannat 2',
    'Sony Music India',
  ],
  [
    'jQTSk-12POI',
    'Teri Jhuki Nazar - Full Audio | Pritam | Shafqat Amanat Ali | Aditi Rao | Randeep Hooda | Murder 3',
    'Sony Music India',
  ],
  ['5jdvpg-Ely4', '19 years still feels like yesterday.', 'Sony Music India'],
  [
    'SpgjABjv7SY',
    'Emraan Hashmi Songs Sunset Mix 2026 | Beach View | DJ Basque | Bollywood Progressive, Afro House',
    'Sony Music India',
  ],
  [
    '1s6Sci8UrxU',
    'Tum Mile - Audio Lyrical | Emraan Hashmi, Soha Ali Khan | Neeraj Shridhar | Pritam',
    'Sony Music India',
  ],
  [
    'YRCMVmDPpkA',
    'Kesariya - Synthwave Remix (Visualiser) | Arijit Singh | Ranbir K, Alia Bhatt | Pritam | Brahmastra',
    'Sony Music India',
  ],
  [
    'mX0_1yejIQI',
    'Woh Lamhe Woh Baatein - Lyrical Video | Emraan Hashmi | Atif Aslam | Shamita Shetty | Zeher',
    'Sony Music India',
  ],
  [
    'FJzE1p3mvw8',
    'Mahiya - 8K/4K Music Video | Awarapan | Emraan Hashmi, Mrinalini Sharma | Pritam | Sayeed Quadri',
    'Sony Music India',
  ],
];

/**
 * The KK jukebox at `ROHAN_SOURCE_URL` as one track.
 *
 * Unlike the Emraan section, this is deliberately not split into its 15 listed
 * songs: the whole hour-long upload is the track. So there is nothing to skip
 * to, and ad-free mode has no per-song title to match against Apple's
 * catalogue — it will find at most the first song, if anything.
 */
const ROHAN_SNAPSHOT: readonly SnapshotRow[] = [
  [
    'r0c1f6XxRQg',
    'Evergreen Hits of KK (Audio Jukebox) | Remembering the Golden Voice | T Series - Bhushan Kumar',
    'T-Series',
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
  {
    id: 'awarapan',
    name: 'Awarapan',
    wordmark: 'आवारापन',
    youTubeUrl: youTubeUrl(AWARAPAN_PLAYLIST_ID),
    source: {
      kind: 'youtube',
      playlistId: AWARAPAN_PLAYLIST_ID,
      tracks: toTracks(AWARAPAN_SNAPSHOT),
    },
  },
  {
    id: 'rohan',
    name: 'Rohan',
    wordmark: 'रोहन',
    // One video, so the badge points at the video itself.
    youTubeUrl: ROHAN_SOURCE_URL,
    source: { kind: 'youtube', tracks: toTracks(ROHAN_SNAPSHOT) },
  },
];

export const DEFAULT_PLAYLIST_ID: PlaylistId = 'safar';
