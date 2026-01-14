// stations.js — Versão Web (Sem FS/Path)
import { advList, newsListSorted } from './adv_news_list.js';

// Helper simples para concatenar strings (substitui path.join)
const mapToPath = (folder, filenameArray) => {
  return filenameArray.map(name => `${folder}/${name}.mp3`);
};

// Helper para gerar array de arquivos baseados em nomes simples
const genList = (base, folder, names) => {
  return names.map(n => `${base}/${folder}/${n}.mp3`);
};

export const getClassRock = () => {
    const bp = 'RADIO_01_CLASS_ROCK';
    return {
      musicas: [
        { id: 'all_the_things_she_said', name: 'ALL_THE_THINGS_SHE_SAID', arquivo: `${bp}/musicas/ALL_THE_THINGS_SHE_SAID.mp3`, introStart: 250879, introEnd: 1699792, finalStart: 10706944, finalEnd: 11536896, capa: `${bp}/capas/all_the_things_she_said.jpg` },
        { id: 'baker_street', name: 'BAKER_STREET', arquivo: `${bp}/musicas/BAKER_STREET.mp3`, introStart: 1375493, introEnd: 2458629, finalStart: 14612480, finalEnd: 15420416, capa: `${bp}/capas/baker_street.jpg` },
        { id: 'big_log', name: 'BIG_LOG', arquivo: `${bp}/musicas/BIG_LOG.mp3`, introStart: 1359872, introEnd: 2512896, finalStart: 8650752, finalEnd: 9685504, capa: `${bp}/capas/big_log.jpg` },
        { id: 'black_velvet', name: 'BLACK_VELVET', arquivo: `${bp}/musicas/BLACK_VELVET.mp3`, introStart: 250120, introEnd: 988160, finalStart: 10655744, finalEnd: 12553216, capa: `${bp}/capas/black_velvet.jpg` },
        { id: 'burning_heart', name: 'BURNING_HEART', arquivo: `${bp}/musicas/BURNING_HEART.mp3`, introStart: 254272, introEnd: 864576, finalStart: 8990464, finalEnd: 10237952, capa: `${bp}/capas/burning_heart.jpg` },
        { id: 'carry_on_my_wayward_sun', name: 'CARRY_ON_MY_WAYWARD_SUN', arquivo: `${bp}/musicas/CARRY_ON_MY_WAYWARD_SUN.mp3`, introStart: 743396, introEnd: 1294336, finalStart: 13821696, finalEnd: 14845440, capa: `${bp}/capas/carry_on_my_wayward_sun.jpg` },
        { id: 'cats_in_the_cradle', name: 'CATS_IN_THE_CRADLE', arquivo: `${bp}/musicas/CATS_IN_THE_CRADLE.mp3`, introStart: 237568, introEnd: 565248, finalStart: 9378560, finalEnd: 10292864, capa: `${bp}/capas/cats_in_the_cradle.jpg` },
        { id: 'circle_in_the_sand', name: 'CIRCLE_IN_THE_SAND', arquivo: `${bp}/musicas/CIRCLE_IN_THE_SAND.mp3`, introStart: 224012, introEnd: 1043212, finalStart: 9497356, finalEnd: 10447907, capa: `${bp}/capas/circle_in_the_sand.jpg` },
        { id: 'coming_on_strong', name: 'COMING_ON_STRONG', arquivo: `${bp}/musicas/COMING_ON_STRONG.mp3`, introStart: 331264, introEnd: 977600, finalStart: 8585532, finalEnd: 9860343, capa: `${bp}/capas/coming_on_strong.jpg` },
        { id: 'danger_zone', name: 'DANGER_ZONE', arquivo: `${bp}/musicas/DANGER_ZONE.mp3`, introStart: 213524, introEnd: 752480, finalStart: 8575840, finalEnd: 9737359, capa: `${bp}/capas/danger_zone.jpg` },
        { id: 'dirty_white_boy', name: 'DIRTY_WHITE_BOY', arquivo: `${bp}/musicas/DIRTY_WHITE_BOY.mp3`, introStart: 334336, introEnd: 1013376, finalStart: 8484802, finalEnd: 9631232, capa: `${bp}/capas/dirty_white_boy.jpg` },
        { id: 'fortunate_son', name: 'FORTUNATE_SON', arquivo: `${bp}/musicas/FORTUNATE_SON.mp3`, introStart: 237648, introEnd: 810064, finalStart: 5005312, finalEnd: 5958144, capa: `${bp}/capas/fortunate_son.jpg` },
        { id: 'gimme_all_your_lovin', name: 'GIMME_ALL_YOUR_LOVIN', arquivo: `${bp}/musicas/GIMME_ALL_YOUR_LOVIN.mp3`, introStart: 265152, introEnd: 1108928, finalStart: 7552000, finalEnd: 8561152, capa: `${bp}/capas/gimme_all_your_lovin.jpg` },
        { id: 'heartbeat', name: 'HEARTBEAT', arquivo: `${bp}/musicas/HEARTBEAT.mp3`, introStart: 378880, introEnd: 861696, finalStart: 7831552, finalEnd: 9260416, capa: `${bp}/capas/heartbeat.jpg` },
        { id: 'higher_love', name: 'HIGHER_LOVE', arquivo: `${bp}/musicas/HIGHER_LOVE.mp3`, finalStart: 11403264, finalEnd: 12459520, capa: `${bp}/capas/higher_love.jpg` },
        { id: 'hollywood_nights', name: 'HOLLYWOOD_NIGHTS', arquivo: `${bp}/musicas/HOLLYWOOD_NIGHTS.mp3`, introStart: 516096, introEnd: 1249792, finalStart: 9228658, finalEnd: 10237952, capa: `${bp}/capas/hollywood_nights.jpg` },
        { id: 'i_cant_wait', name: 'I_CANT_WAIT', arquivo: `${bp}/musicas/I_CANT_WAIT.mp3`, introStart: 837632, introEnd: 1549216, finalStart: 10679200, finalEnd: 11561248, capa: `${bp}/capas/i_cant_wait.jpg` },
        { id: 'i_dont_care_anymore', name: 'I_DONT_CARE_ANYMORE', arquivo: `${bp}/musicas/I_DONT_CARE_ANYMORE.mp3`, introStart: 626688, introEnd: 1453824, finalStart: 12763136, finalEnd: 13968384, capa: `${bp}/capas/i_dont_care_anymore.jpg` },
        { id: 'i_wouldnt_want_to_be', name: 'I_WOULDNT_WANT_TO_BE', arquivo: `${bp}/musicas/I_WOULDNT_WANT_TO_BE.mp3`, introStart: 1114112, introEnd: 2253312, finalStart: 6338752, finalEnd: 8605696, capa: `${bp}/capas/i_wouldnt_want_to_be.jpg` },
        { id: 'if_you_leave_me_now', name: 'IF_YOU_LEAVE_ME_NOW', arquivo: `${bp}/musicas/IF_YOU_LEAVE_ME_NOW.mp3`, introStart: 168960, introEnd: 438784, finalStart: 8550400, finalEnd: 9272320, capa: `${bp}/capas/if_you_leave_me_now.jpg` },
        { id: 'im_free', name: 'IM_FREE', arquivo: `${bp}/musicas/IM_FREE.mp3`, introStart: 504800, introEnd: 916128, finalStart: 8576416, finalEnd: 9265568, capa: `${bp}/capas/im_free.jpg` },
        { id: 'lonely_is_the_night', name: 'LONELY_IS_THE_NIGHT', arquivo: `${bp}/musicas/LONELY_IS_THE_NIGHT.mp3`, introStart: 276271, introEnd: 644864, finalStart: 9213224, finalEnd: 10259040, capa: `${bp}/capas/lonely_is_the_night.jpg` },
        { id: 'mississippi_queen', name: 'MISSISSIPPI_QUEEN', arquivo: `${bp}/musicas/MISSISSIPPI_QUEEN.mp3`, introStart: 259216, introEnd: 795792, finalStart: 5821419, finalEnd: 6718608, capa: `${bp}/capas/mississippi_queen.jpg` },
        { id: 'night_moves', name: 'NIGHT_MOVES', arquivo: `${bp}/musicas/NIGHT_MOVES.mp3`, introStart: 342016, introEnd: 798720, finalStart: 9445376, finalEnd: 11402240, capa: `${bp}/capas/night_moves.jpg` },
        { id: 'ogdens_nut_gone_flake', name: 'OGDENS_NUT_GONE_FLAKE', arquivo: `${bp}/musicas/OGDENS_NUT_GONE_FLAKE.mp3`, introStart: 1515520, introEnd: 2539008, finalStart: 5377278, finalEnd: 6280192, capa: `${bp}/capas/ogdens_nut_gone_flake.jpg` },
        { id: 'peace_of_mind', name: 'PEACE_OF_MIND', arquivo: `${bp}/musicas/PEACE_OF_MIND.mp3`, introStart: 231632, introEnd: 1071312, finalStart: 11753680, finalEnd: 12542206, capa: `${bp}/capas/peace_of_mind.jpg` },
        { id: 'photograph', name: 'PHOTOGRAPH', arquivo: `${bp}/musicas/PHOTOGRAPH.mp3`, introStart: 277504, introEnd: 686080, finalStart: 8680144, finalEnd: 10046720, capa: `${bp}/capas/photograph.jpg` },
        { id: 'radio_ga_ga', name: 'RADIO_GA_GA', arquivo: `${bp}/musicas/RADIO_GA_GA.mp3`, introStart: 1490944, introEnd: 2642432, finalStart: 11321344, finalEnd: 12807680, capa: `${bp}/capas/radio_ga_ga.jpg` },
        { id: 'rain', name: 'RAIN', arquivo: `${bp}/musicas/RAIN.mp3`, introStart: 258010, introEnd: 712704, finalStart: 8208384, finalEnd: 10125312, capa: `${bp}/capas/rain.jpg` },
        { id: 'rockin_me', name: 'ROCKIN_ME', arquivo: `${bp}/musicas/ROCKIN_ME.mp3`, introStart: 450560, introEnd: 1291264, finalStart: 6389760, finalEnd: 7690240, capa: `${bp}/capas/rockin_me.jpg` },
        { id: 'roundabout', name: 'ROUNDABOUT', arquivo: `${bp}/musicas/ROUNDABOUT.mp3`, introStart: 269312, introEnd: 2055168, finalStart: 22682624, finalEnd: 24058880, capa: `${bp}/capas/roundabout.jpg` },
        { id: 'saturday_nights_alright', name: 'SATURDAY_NIGHTS_ALRIGHT', arquivo: `${bp}/musicas/SATURDAY_NIGHTS_ALRIGHT.mp3`, introStart: 286720, introEnd: 633600, finalStart: 9560339, finalEnd: 10156032, capa: `${bp}/capas/saturday_nights_alright.jpg` },
        { id: 'shadows_of_the_night', name: 'SHADOWS_OF_THE_NIGHT', arquivo: `${bp}/musicas/SHADOWS_OF_THE_NIGHT.mp3`, introStart: 787264, introEnd: 1536832, finalStart: 8945152, finalEnd: 9900544, capa: `${bp}/capas/shadows_of_the_night.jpg` },
        { id: 'the_breakup_song', name: 'THE_BREAKUP_SONG', arquivo: `${bp}/musicas/THE_BREAKUP_SONG.mp3`, introStart: 262144, introEnd: 627957, finalStart: 6111232, finalEnd: 6981632, capa: `${bp}/capas/the_breakup_song.jpg` },
        { id: 'thirty_days_in_the_hole', name: 'THIRTY_DAYS_IN_THE_HOLE', arquivo: `${bp}/musicas/THIRTY_DAYS_IN_THE_HOLE.mp3`, introStart: 245452, introEnd: 574511, finalStart: 8102144, finalEnd: 8963328, capa: `${bp}/capas/thirty_days_in_the_hole.jpg` },
        { id: 'too_late_for_goodbyes', name: 'TOO_LATE_FOR_GOODBYES', arquivo: `${bp}/musicas/TOO_LATE_FOR_GOODBYES.mp3`, introStart: 638976, introEnd: 1512192, finalStart: 7901184, finalEnd: 8647680, capa: `${bp}/capas/too_late_for_goodbyes.jpg` },
        { id: 'we_built_this_city', name: 'WE_BUILT_THIS_CITY', arquivo: `${bp}/musicas/WE_BUILT_THIS_CITY.mp3`, introStart: 810496, introEnd: 1379090, finalStart: 11787264, finalEnd: 13023232, capa: `${bp}/capas/we_built_this_city.jpg` },
        { id: 'what_a_fool_believes', name: 'WHAT_A_FOOL_BELIEVES', arquivo: `${bp}/musicas/WHAT_A_FOOL_BELIEVES.mp3`, introStart: 358400, introEnd: 737024, finalStart: 8007680, finalEnd: 8962048, capa: `${bp}/capas/what_a_fool_believes.jpg` }
      ],
      ids: genList(bp, 'narracoes', Array.from({length:13},(_,i)=>`ID_${String(i+1).padStart(2,'0')}`)),
      solos: genList(bp, 'narracoes', Array.from({length:25},(_,i)=>`MONO_SOLO_${String(i+1).padStart(2,'0')}`)),
      general: genList(bp, 'narracoes', Array.from({length:43},(_,i)=>`GENERAL_${String(i+1).padStart(2,'0')}`)),
      timePools: {
        morning: genList(bp, 'narracoes', Array.from({length:7},(_,i)=>`MORNING_${String(i+1).padStart(2,'0')}`)),
        evening: genList(bp, 'narracoes', Array.from({length:6},(_,i)=>`EVENING_${String(i+1).padStart(2,'0')}`))
      },
      endto: {
        toad: genList(bp, 'narracoes', Array.from({length:7},(_,i)=>`TO_AD_${String(i+1).padStart(2,'0')}`)),
        tonews: genList(bp, 'narracoes', Array.from({length:6},(_,i)=>`TO_NEWS_${String(i+1).padStart(2,'0')}`))
      },
      introNarrations: {
        'ALL_THE_THINGS_SHE_SAID': genList(bp, 'narracoes', ['ALL_THE_THINGS_SHE_SAID_01', 'ALL_THE_THINGS_SHE_SAID_02']),
        'BAKER_STREET': genList(bp, 'narracoes', ['BAKER_STREET_01', 'BAKER_STREET_02']),
        'BIG_LOG': genList(bp, 'narracoes', ['BIG_LOG_01', 'BIG_LOG_02']),
        'BLACK_VELVET': genList(bp, 'narracoes', ['BLACK_VELVET_01', 'BLACK_VELVET_02']),
        'BURNING_HEART': genList(bp, 'narracoes', ['BURNING_HEART_01', 'BURNING_HEART_02']),
        'CARRY_ON_MY_WAYWARD_SUN': genList(bp, 'narracoes', ['CARRY_ON_MY_WAYWARD_SUN_01', 'CARRY_ON_MY_WAYWARD_SUN_02']),
        'CATS_IN_THE_CRADLE': genList(bp, 'narracoes', ['CATS_IN_THE_CRADLE_01']),
        'COMING_ON_STRONG': genList(bp, 'narracoes', ['COMING_ON_STRONG_01', 'COMING_ON_STRONG_02']),
        'DIRTY_WHITE_BOY': genList(bp, 'narracoes', ['DIRTY_WHITE_BOY_01', 'DIRTY_WHITE_BOY_02']),
        'FORTUNATE_SON': genList(bp, 'narracoes', ['FORTUNATE_SON_01', 'FORTUNATE_SON_02']),
        'GIMME_ALL_YOUR_LOVIN': genList(bp, 'narracoes', ['GIMME_ALL_YOUR_LOVIN_01', 'GIMME_ALL_YOUR_LOVIN_02']),
        'HEARTBEAT': genList(bp, 'narracoes', ['HEARTBEAT_01', 'HEARTBEAT_02']),
        'HOLLYWOOD_NIGHTS': genList(bp, 'narracoes', ['HOLLYWOOD_NIGHTS_01', 'HOLLYWOOD_NIGHTS_02']),
        'I_CANT_WAIT': genList(bp, 'narracoes', ['I_CANT_WAIT_01', 'I_CANT_WAIT_02']),
        'I_WOULDNT_WANT_TO_BE': genList(bp, 'narracoes', ['I_WOULDNT_WANT_TO_BE_01', 'I_WOULDNT_WANT_TO_BE_02']),
        'IF_YOU_LEAVE_ME_NOW': genList(bp, 'narracoes', ['IF_YOU_LEAVE_ME_NOW_01', 'IF_YOU_LEAVE_ME_NOW_02']),
        'IM_FREE': genList(bp, 'narracoes', ['IM_FREE_01', 'IM_FREE_02']),
        'LONELY_IS_THE_NIGHT': genList(bp, 'narracoes', ['LONELY_IS_THE_NIGHT_01', 'LONELY_IS_THE_NIGHT_02']),
        'MISSISSIPPI_QUEEN': genList(bp, 'narracoes', ['MISSISSIPPI_QUEEN_01', 'MISSISSIPPI_QUEEN_02']),
        'NIGHT_MOVES': genList(bp, 'narracoes', ['NIGHT_MOVES_01', 'NIGHT_MOVES_02']),
        'OGDENS_NUT_GONE_FLAKE': genList(bp, 'narracoes', ['OGDENS_NUT_GONE_FLAKE_01', 'OGDENS_NUT_GONE_FLAKE_02']),
        'PEACE_OF_MIND': genList(bp, 'narracoes', ['PEACE_OF_MIND_01', 'PEACE_OF_MIND_02']),
        'PHOTOGRAPH': genList(bp, 'narracoes', ['PHOTOGRAPH_01', 'PHOTOGRAPH_02']),
        'RADIO_GA_GA': genList(bp, 'narracoes', ['RADIO_GA_GA_01']),
        'RAIN': genList(bp, 'narracoes', ['RAIN_01', 'RAIN_02']),
        'ROUNDABOUT': genList(bp, 'narracoes', ['ROUNDABOUT_01', 'ROUNDABOUT_02']),
        'SATURDAY_NIGHTS_ALRIGHT': genList(bp, 'narracoes', ['SATURDAY_NIGHTS_ALRIGHT_01', 'SATURDAY_NIGHTS_ALRIGHT_02']),
        'SHADOWS_OF_THE_NIGHT': genList(bp, 'narracoes', ['SHADOWS_OF_THE_NIGHT_01', 'SHADOWS_OF_THE_NIGHT_02', 'SHADOWS_OF_THE_NIGHT_03']),
        'THE_BREAKUP_SONG': genList(bp, 'narracoes', ['THE_BREAKUP_SONG_01', 'THE_BREAKUP_SONG_02']),
        'THIRTY_DAYS_IN_THE_HOLE': genList(bp, 'narracoes', ['THIRTY_DAYS_IN_THE_HOLE_01', 'THIRTY_DAYS_IN_THE_HOLE_02']),
        'TOO_LATE_FOR_GOODBYES': genList(bp, 'narracoes', ['TOO_LATE_FOR_GOODBYES_01', 'TOO_LATE_FOR_GOODBYES_02']),
        'WE_BUILT_THIS_CITY': genList(bp, 'narracoes', ['WE_BUILT_THIS_CITY_01', 'WE_BUILT_THIS_CITY_02']),
        'WHAT_A_FOOL_BELIEVES': genList(bp, 'narracoes', ['WHAT_A_FOOL_BELIEVES_01', 'WHAT_A_FOOL_BELIEVES_02'])
      },
      adv: mapToPath('adv', advList),
      news: mapToPath('news', newsListSorted)
    };
  };

  export const getSilver = () => {
    const bp = 'RADIO_16_SILVERLAKE';
    return {
      musicas: [
        { id: 'always', name: 'ALWAYS', arquivo: `${bp}/musicas/ALWAYS.mp3`, introStart: 807008, introEnd: 1523808, finalStart: 8671232, finalEnd: 9777152, capa: `${bp}/capas/always.jpg` },
        { id: 'boogie_in_zero_gravity', name: 'BOOGIE_IN_ZERO_GRAVITY', arquivo: `${bp}/musicas/BOOGIE_IN_ZERO_GRAVITY.mp3`, introStart: 247856, introEnd: 741376, finalStart: 7970816, finalEnd: 10113536, capa: `${bp}/capas/boogie_in_zero_gravity.jpg` },
        { id: 'change_of_coast', name: 'CHANGE_OF_COAST', arquivo: `${bp}/musicas/CHANGE_OF_COAST.mp3`, finalStart: 7163904, finalEnd: 8303936, capa: `${bp}/capas/change_of_coast.jpg` },
        { id: 'colours', name: 'COLOURS', arquivo: `${bp}/musicas/COLOURS.mp3`, introStart: 250178, introEnd: 794624, finalStart: 7598080, finalEnd: 9236480, capa: `${bp}/capas/colours.jpg` },
        { id: 'crystalfilm', name: 'CRYSTALFILM', arquivo: `${bp}/musicas/CRYSTALFILM.mp3`, introStart: 244611, introEnd: 641923, finalStart: 9728000, finalEnd: 10845184, capa: `${bp}/capas/crystalfilm.jpg` },
        { id: 'dark_matter', name: 'DARK_MATTER', arquivo: `${bp}/musicas/DARK_MATTER.mp3`, introStart: 242650, introEnd: 844800, finalStart: 7999488, finalEnd: 9060352, capa: `${bp}/capas/dark_matter.jpg` },
        { id: 'do_you_believe', name: 'DO_YOU_BELIEVE', arquivo: `${bp}/musicas/DO_YOU_BELIEVE.mp3`, introStart: 696320, introEnd: 1992704, finalStart: 7987200, finalEnd: 9939968, capa: `${bp}/capas/do_you_believe.jpg` },
        { id: 'dont_come_close', name: 'DONT_COME_CLOSE', arquivo: `${bp}/musicas/DONT_COME_CLOSE.mp3`, finalStart: 7315456, finalEnd: 8378368, capa: `${bp}/capas/dont_come_close.jpg` },
        { id: 'feel_the_same', name: 'FEEL_THE_SAME', arquivo: `${bp}/musicas/FEEL_THE_SAME.mp3`, introStart: 256482, introEnd: 1426432, finalStart: 8237056, finalEnd: 9319424, capa: `${bp}/capas/feel_the_same.jpg` },
        { id: 'flutes', name: 'FLUTES', arquivo: `${bp}/musicas/FLUTES.mp3`, introStart: 249856, introEnd: 1196032, finalStart: 10186752, finalEnd: 11188224, capa: `${bp}/capas/flutes.jpg` },
        { id: 'forget', name: 'FORGET', arquivo: `${bp}/musicas/FORGET.mp3`, introStart: 258048, introEnd: 1110016, finalStart: 9039616, finalEnd: 10320896, capa: `${bp}/capas/forget.jpg` },
        { id: 'from_nowhere', name: 'FROM_NOWHERE', arquivo: `${bp}/musicas/FROM_NOWHERE.mp3`, introStart: 311296, introEnd: 1075200, finalStart: 9027584, finalEnd: 10075136, capa: `${bp}/capas/from_nowhere.jpg` },
        { id: 'heart_in_the_pipes', name: 'HEART_IN_THE_PIPES', arquivo: `${bp}/musicas/HEART_IN_THE_PIPES.mp3`, introStart: 517821, introEnd: 1084544, finalStart: 8904832, finalEnd: 10298368, capa: `${bp}/capas/heart_in_the_pipes.jpg` },
        { id: 'heartbreak', name: 'HEARTBREAK', arquivo: `${bp}/musicas/HEARTBREAK.mp3`, introStart: 264252, introEnd: 780348, finalStart: 9153018, finalEnd: 10205244, capa: `${bp}/capas/heartbreak.jpg` },
        { id: 'high_pressure', name: 'HIGH_PRESSURE', arquivo: `${bp}/musicas/HIGH_PRESSURE.mp3`, introStart: 256419, introEnd: 1513984, finalStart: 7163904, finalEnd: 8612869, capa: `${bp}/capas/high_pressure.jpg` },
        { id: 'hold_on_holy_ghost', name: 'HOLD_ON_HOLY_GHOST', arquivo: `${bp}/musicas/HOLD_ON_HOLY_GHOST.mp3`, introStart: 241664, introEnd: 2358824, finalStart: 15363584, finalEnd: 16437248, capa: `${bp}/capas/hold_on_holy_ghost.jpg` },
        { id: 'in_real_life', name: 'IN_REAL_LIFE', arquivo: `${bp}/musicas/IN_REAL_LIFE.mp3`, introStart: 233830, introEnd: 716800, finalStart: 8577024, finalEnd: 9569717, capa: `${bp}/capas/in_real_life.jpg` },
        { id: 'jasmine', name: 'JASMINE', arquivo: `${bp}/musicas/JASMINE.mp3`, introStart: 255715, introEnd: 1289216, finalStart: 8884224, finalEnd: 9996288, capa: `${bp}/capas/jasmine.jpg` },
        { id: 'little_white_lie', name: 'LITTLE_WHITE_LIE', arquivo: `${bp}/musicas/LITTLE_WHITE_LIE.mp3`, finalStart: 6449152, finalEnd: 7852032, capa: `${bp}/capas/little_white_lie.jpg` },
        { id: 'living_in_america', name: 'LIVING_IN_AMERICA', arquivo: `${bp}/musicas/LIVING_IN_AMERICA.mp3`, introStart: 243712, introEnd: 655360, finalStart: 7434240, finalEnd: 8550400, capa: `${bp}/capas/living_in_america.jpg` },
        { id: 'lucky_boy', name: 'LUCKY_BOY', arquivo: `${bp}/musicas/LUCKY_BOY.mp3`, introStart: 720768, introEnd: 1556480, finalStart: 8329216, finalEnd: 9457664, capa: `${bp}/capas/lucky_boy.jpg` },
        { id: 'mesmerized', name: 'MESMERIZED', arquivo: `${bp}/musicas/MESMERIZED.mp3`, introStart: 245760, introEnd: 762904, finalStart: 9000448, finalEnd: 10037248, capa: `${bp}/capas/mesmerized.jpg` },
        { id: 'new_beat', name: 'NEW_BEAT', arquivo: `${bp}/musicas/NEW_BEAT.mp3`, introStart: 241664, introEnd: 1994752, finalStart: 10249728, finalEnd: 11254272, capa: `${bp}/capas/new_beat.jpg` },
        { id: 'nowhere_to_go', name: 'NOWHERE_TO_GO', arquivo: `${bp}/musicas/NOWHERE_TO_GO.mp3`, introStart: 256152, introEnd: 688128, finalStart: 8003584, finalEnd: 9518080, capa: `${bp}/capas/nowhere_to_go.jpg` },
        { id: 'o_n_e', name: 'O_N_E', arquivo: `${bp}/musicas/O_N_E.mp3`, introStart: 255999, introEnd: 778240, finalStart: 11317248, finalEnd: 12245228, capa: `${bp}/capas/o_n_e.jpg` },
        { id: 'old_love', name: 'OLD_LOVE', arquivo: `${bp}/musicas/OLD_LOVE.mp3`, finalStart: 9064448, finalEnd: 10450944, capa: `${bp}/capas/old_love.jpg` },
        { id: 'one_girl_one_boy', name: 'ONE_GIRL_ONE_BOY', arquivo: `${bp}/musicas/ONE_GIRL_ONE_BOY.mp3`, introStart: 254928, introEnd: 1118208, finalStart: 7729152, finalEnd: 9238849, capa: `${bp}/capas/one_girl_one_boy.jpg` },
        { id: 'pharaohs', name: 'PHARAOHS', arquivo: `${bp}/musicas/PHARAOHS.mp3`, introStart: 249163, introEnd: 1396043, finalStart: 8873984, finalEnd: 9968640, capa: `${bp}/capas/pharaohs.jpg` },
        { id: 'polish_girl', name: 'POLISH_GIRL', arquivo: `${bp}/musicas/POLISH_GIRL.mp3`, introStart: 245026, introEnd: 781602, finalStart: 11304226, finalEnd: 12310765, capa: `${bp}/capas/polish_girl.jpg` },
        { id: 'psychic_city', name: 'PSYCHIC_CITY', arquivo: `${bp}/musicas/PSYCHIC_CITY.mp3`, introStart: 255025, introEnd: 1275136, finalStart: 8185856, finalEnd: 9440256, capa: `${bp}/capas/psychic_city.jpg` },
        { id: 'shine_a_light', name: 'SHINE_A_LIGHT', arquivo: `${bp}/musicas/SHINE_A_LIGHT.mp3`, introStart: 694784, introEnd: 1773568, finalStart: 8704256, finalEnd: 10103296, capa: `${bp}/capas/shine_a_light.jpg` },
        { id: 'shooting_holes', name: 'SHOOTING_HOLES', arquivo: `${bp}/musicas/SHOOTING_HOLES.mp3`, introStart: 229376, introEnd: 2011136, finalStart: 7929856, finalEnd: 8606976, capa: `${bp}/capas/shooting_holes.jpg` },
        { id: 'sleepwalking', name: 'SLEEPWALKING', arquivo: `${bp}/musicas/SLEEPWALKING.mp3`, introStart: 272269, introEnd: 1757184, finalStart: 7789312, finalEnd: 9001728, capa: `${bp}/capas/sleepwalking.jpg` },
        { id: 'so_many_details', name: 'SO_MANY_DETAILS', arquivo: `${bp}/musicas/SO_MANY_DETAILS.mp3`, introStart: 262911, introEnd: 640000, finalStart: 8888320, finalEnd: 10385408, capa: `${bp}/capas/so_many_details.jpg` },
        { id: 'sometimes', name: 'SOMETIMES', arquivo: `${bp}/musicas/SOMETIMES.mp3`, introStart: 260172, introEnd: 2162688, finalStart: 8871936, finalEnd: 10143744, capa: `${bp}/capas/sometimes.jpg` },
        { id: 'strangers_in_the_wind', name: 'STRANGERS_IN_THE_WIND', arquivo: `${bp}/musicas/STRANGERS_IN_THE_WIND.mp3`, introStart: 268268, introEnd: 780268, finalStart: 11074560, finalEnd: 11944448, capa: `${bp}/capas/strangers_in_the_wind.jpg` },
        { id: 'the_drummer', name: 'THE_DRUMMER', arquivo: `${bp}/musicas/THE_DRUMMER.mp3`, introStart: 220160, introEnd: 548864, finalStart: 9033048, finalEnd: 9626624, capa: `${bp}/capas/the_drummer.jpg` },
        { id: 'the_set_up', name: 'THE_SET_UP', arquivo: `${bp}/musicas/THE_SET_UP.mp3`, finalStart: 7981696, finalEnd: 9700992, capa: `${bp}/capas/the_set_up.jpg` },
        { id: 'truly_alive', name: 'TRULY_ALIVE', arquivo: `${bp}/musicas/TRULY_ALIVE.mp3`, introStart: 258784, introEnd: 765952, finalStart: 11464704, finalEnd: 12463361, capa: `${bp}/capas/truly_alive.jpg` },
        { id: 'when_youre_out', name: 'WHEN_YOURE_OUT', arquivo: `${bp}/musicas/WHEN_YOURE_OUT.mp3`, introStart: 237568, introEnd: 401933, finalStart: 11395840, finalEnd: 12422144, capa: `${bp}/capas/when_youre_out.jpg` }
      ],
      ids: genList(bp, 'narracoes', Array.from({length:13},(_,i)=>`ID_${String(i+1).padStart(2,'0')}`)),
      solos: genList(bp, 'narracoes', Array.from({length:13},(_,i)=>`MONO_SOLO_${String(i+1).padStart(2,'0')}`)),
      general: genList(bp, 'narracoes', Array.from({length:30},(_,i)=>`GENERAL_${String(i+1).padStart(2,'0')}`).filter(n => !n.endsWith('15'))), 
      timePools: {
        morning: genList(bp, 'narracoes', Array.from({length:4},(_,i)=>`MORNING_${String(i+1).padStart(2,'0')}`)),
        evening: genList(bp, 'narracoes', Array.from({length:4},(_,i)=>`EVENING_${String(i+1).padStart(2,'0')}`))
      },
      endto: {
        toad: genList(bp, 'narracoes', Array.from({length:5},(_,i)=>`TO_AD_${String(i+1).padStart(2,'0')}`)),
        tonews: genList(bp, 'narracoes', Array.from({length:4},(_,i)=>`TO_NEWS_${String(i+1).padStart(2,'0')}`))
      },
      introNarrations: {
        'ALWAYS': genList(bp, 'narracoes', ['ALWAYS_01', 'ALWAYS_02']),
        'BOOGIE_IN_ZERO_GRAVITY': genList(bp, 'narracoes', ['BOOGIE_IN_ZERO_GRAVITY_01', 'BOOGIE_IN_ZERO_GRAVITY_02']),
        'CRYSTALFILM': genList(bp, 'narracoes', ['CRYSTALFILM_01', 'CRYSTALFILM_02']),
        'DARK_MATTER': genList(bp, 'narracoes', ['DARK_MATTER_01', 'DARK_MATTER_02']),
        'DO_YOU_BELIEVE': genList(bp, 'narracoes', ['DO_YOU_BELIEVE_01', 'DO_YOU_BELIEVE_02']),
        'FEEL_THE_SAME': genList(bp, 'narracoes', ['FEEL_THE_SAME_01', 'FEEL_THE_SAME_02']),
        'FORGET': genList(bp, 'narracoes', ['FORGET_01', 'FORGET_02']),
        'FROM_NOWHERE': genList(bp, 'narracoes', ['FROM_NOWHERE_01', 'FROM_NOWHERE_02']),
        'HEART_IN_THE_PIPES': genList(bp, 'narracoes', ['HEART_IN_THE_PIPES_01', 'HEART_IN_THE_PIPES_02']),
        'HOLD_ON_HOLY_GHOST': genList(bp, 'narracoes', ['HOLD_ON_HOLY_GHOST_01', 'HOLD_ON_HOLY_GHOST_02']),
        'IN_REAL_LIFE': genList(bp, 'narracoes', ['IN_REAL_LIFE_01', 'IN_REAL_LIFE_02']),
        'JASMINE': genList(bp, 'narracoes', ['JASMINE_01', 'JASMINE_02']),
        'LIVING_IN_AMERICA': genList(bp, 'narracoes', ['LIVING_IN_AMERICA_01', 'LIVING_IN_AMERICA_02']),
        'LUCKY_BOY': genList(bp, 'narracoes', ['LUCKY_BOY_01', 'LUCKY_BOY_02']),
        'NEW_BEAT': genList(bp, 'narracoes', ['NEW_BEAT_01', 'NEW_BEAT_02']),
        'NOWHERE_TO_GO': genList(bp, 'narracoes', ['NOWHERE_TO_GO_01', 'NOWHERE_TO_GO_02']),
        'ONE_GIRL_ONE_BOY': genList(bp, 'narracoes', ['ONE_GIRL_ONE_BOY_01', 'ONE_GIRL_ONE_BOY_02']),
        'PHARAOHS': genList(bp, 'narracoes', ['PHARAOHS_01', 'PHARAOHS_02']),
        'POLISH_GIRL': genList(bp, 'narracoes', ['POLISH_GIRL_01', 'POLISH_GIRL_02']),
        'PSYCHIC_CITY': genList(bp, 'narracoes', ['PSYCHIC_CITY_01', 'PSYCHIC_CITY_02']),
        'SHINE_A_LIGHT': genList(bp, 'narracoes', ['SHINE_A_LIGHT_01', 'SHINE_A_LIGHT_02']),
        'SHOOTING_HOLES': genList(bp, 'narracoes', ['SHOOTING_HOLES_01', 'SHOOTING_HOLES_02']),
        'SLEEPWALKING': genList(bp, 'narracoes', ['SLEEPWALKING_01', 'SLEEPWALKING_02']),
        'SO_MANY_DETAILS': genList(bp, 'narracoes', ['SO_MANY_DETAILS_01', 'SO_MANY_DETAILS_02']),
        'SOMETIMES': genList(bp, 'narracoes', ['SOMETIMES_01', 'SOMETIMES_02']),
        'THE_DRUMMER': genList(bp, 'narracoes', ['THE_DRUMMER_01', 'THE_DRUMMER_02']),
        'TRULY_ALIVE': genList(bp, 'narracoes', ['TRULY_ALIVE_01', 'TRULY_ALIVE_02']),
        'WHEN_YOURE_OUT': genList(bp, 'narracoes', ['WHEN_YOURE_OUT_01', 'WHEN_YOURE_OUT_02'])
      },
      adv: mapToPath('adv', advList),
      news: mapToPath('news', newsListSorted)
  };
};

export const getRock = () => {
    const bp = 'RADIO_18_90S_ROCK';
    return {
      musicas: [
        { id: 'answer_to_yourself', name: 'ANSWER_TO_YOURSELF', arquivo: `${bp}/musicas/ANSWER_TO_YOURSELF.mp3`, introStart: 258048, introEnd: 1274829, finalStart: 8233984, finalEnd: 9037312, capa: `${bp}/capas/answer_to_yourself.jpg` },
        { id: 'black_grease', name: 'BLACK_GREASE', arquivo: `${bp}/musicas/BLACK_GREASE.mp3`, introStart: 506496, introEnd: 1882752, finalStart: 9038464, finalEnd: 10278912, capa: `${bp}/capas/black_grease.jpg` },
        { id: 'california_girls', name: 'CALIFORNIA_GIRLS', arquivo: `${bp}/musicas/CALIFORNIA_GIRLS.mp3`, introStart: 275302, introEnd: 912512, finalStart: 5776512, finalEnd: 7320704, capa: `${bp}/capas/california_girls.jpg` },
        { id: 'cocaine', name: 'COCAINE', arquivo: `${bp}/musicas/COCAINE.mp3`, introStart: 255662, introEnd: 1418405, finalStart: 6733824, finalEnd: 8011776, capa: `${bp}/capas/cocaine.jpg` },
        { id: 'crawling_after_you', name: 'CRAWLING_AFTER_YOU', arquivo: `${bp}/musicas/CRAWLING_AFTER_YOU.mp3`, introStart: 254132, introEnd: 509440, finalStart: 8192000, finalEnd: 9403392, capa: `${bp}/capas/crawling_after_you.jpg` },
        { id: 'diddy_wah_diddy', name: 'DIDDY_WAH_DIDDY', arquivo: `${bp}/musicas/DIDDY_WAH_DIDDY.mp3`, introStart: 258048, introEnd: 592128, finalStart: 4625920, finalEnd: 5621248, capa: `${bp}/capas/diddy_wah_diddy.jpg` },
        { id: 'fall_in_line', name: 'FALL_IN_LINE', arquivo: `${bp}/musicas/FALL_IN_LINE.mp3`, introStart: 242176, introEnd: 863013, finalStart: 7129088, finalEnd: 8309760, capa: `${bp}/capas/fall_in_line.jpg` },
        { id: 'fire_doesnt_burn_itself', name: 'FIRE_DOESNT_BURN_ITSELF', arquivo: `${bp}/musicas/FIRE_DOESNT_BURN_ITSELF.mp3`, introStart: 278656, introEnd: 1273472, finalStart: 9617536, finalEnd: 10627200, capa: `${bp}/capas/fire_doesnt_burn_itself.jpg` },
        { id: 'gone_for_good', name: 'GONE_FOR_GOOD', arquivo: `${bp}/musicas/GONE_FOR_GOOD.mp3`, introStart: 245760, introEnd: 552960, finalStart: 3705856, finalEnd: 4708352, capa: `${bp}/capas/gone_for_good.jpg` },
        { id: 'hysteria', name: 'HYSTERIA', arquivo: `${bp}/musicas/HYSTERIA.mp3`, introStart: 266903, introEnd: 1393792, finalStart: 5333120, finalEnd: 6623360, capa: `${bp}/capas/hysteria.jpg` },
        { id: 'next_stop', name: 'NEXT_STOP', arquivo: `${bp}/musicas/NEXT_STOP.mp3`, introStart: 286472, introEnd: 1158920, finalStart: 5670009, finalEnd: 6930432, capa: `${bp}/capas/next_stop.jpg` },
        { id: 'nine_is_god', name: 'NINE_IS_GOD', arquivo: `${bp}/musicas/NINE_IS_GOD.mp3`, finalStart: 7716864, finalEnd: 9555968, capa: `${bp}/capas/nine_is_god.jpg` },
        { id: 'sixpack', name: 'SIXPACK', arquivo: `${bp}/musicas/SIXPACK.mp3`, finalStart: 5801984, finalEnd: 6922240, capa: `${bp}/capas/sixpack.jpg` },
        { id: 'sleepwalker', name: 'SLEEPWALKER', arquivo: `${bp}/musicas/SLEEPWALKER.mp3`, introStart: 253234, introEnd: 1753088, finalStart: 8564736, finalEnd: 9850880, capa: `${bp}/capas/sleepwalker.jpg` },
        { id: 'the_dream', name: 'THE_DREAM', arquivo: `${bp}/musicas/THE_DREAM.mp3`, introStart: 280452, introEnd: 763648, finalStart: 8560384, finalEnd: 9851904, capa: `${bp}/capas/the_dream.jpg` },
        { id: 'this_mystic_decade', name: 'THIS_MYSTIC_DECADE', arquivo: `${bp}/musicas/THIS_MYSTIC_DECADE.mp3`, introStart: 243969, introEnd: 1219584, finalStart: 7122944, finalEnd: 8421774, capa: `${bp}/capas/this_mystic_decade.jpg` },
        { id: 'turn_it_around', name: 'TURN_IT_AROUND', arquivo: `${bp}/musicas/TURN_IT_AROUND.mp3`, introStart: 259536, introEnd: 1095120, finalStart: 9929728, finalEnd: 11004416, capa: `${bp}/capas/turn_it_around.jpg` },
        { id: 'used_blood', name: 'USED_BLOOD', arquivo: `${bp}/musicas/USED_BLOOD.mp3`, introStart: 249733, introEnd: 1023877, finalStart: 8056832, finalEnd: 8986624, capa: `${bp}/capas/used_blood.jpg` },
        { id: 'wet_blanket', name: 'WET_BLANKET', arquivo: `${bp}/musicas/WET_BLANKET.mp3`, introStart: 257916, introEnd: 1298432, finalStart: 8089600, finalEnd: 9286702, capa: `${bp}/capas/wet_blanket.jpg` },
        { id: 'who_needs_you', name: 'WHO_NEEDS_YOU', arquivo: `${bp}/musicas/WHO_NEEDS_YOU.mp3`, introStart: 233472, introEnd: 1036288, finalStart: 8056832, finalEnd: 8986624, capa: `${bp}/capas/who_needs_you.jpg` }
      ],
      ids: genList(bp, 'narracoes', Array.from({length:9},(_,i)=>`ID_${String(i+1).padStart(2,'0')}`)),
      solos: genList(bp, 'narracoes', Array.from({length:16},(_,i)=>`MONO_SOLO_${String(i+1).padStart(2,'0')}`)),
      general: genList(bp, 'narracoes', Array.from({length:48},(_,i)=>`GENERAL_${String(i+1).padStart(2,'0')}`)),
      timePools: {
        morning: genList(bp, 'narracoes', Array.from({length:5},(_,i)=>`MORNING_${String(i+1).padStart(2,'0')}`)),
        evening: genList(bp, 'narracoes', Array.from({length:5},(_,i)=>`EVENING_${String(i+1).padStart(2,'0')}`))
      },
      endto: {
        toad: genList(bp, 'narracoes', Array.from({length:5},(_,i)=>`TO_AD_${String(i+1).padStart(2,'0')}`)),
        tonews: genList(bp, 'narracoes', Array.from({length:3},(_,i)=>`TO_NEWS_${String(i+1).padStart(2,'0')}`))
      },
      introNarrations: {
        'ANSWER_TO_YOURSELF': genList(bp, 'narracoes', ['ANSWER_TO_YOURSELF_01', 'ANSWER_TO_YOURSELF_02']),
        'BLACK_GREASE': genList(bp, 'narracoes', ['BLACK_GREASE_01', 'BLACK_GREASE_02']),
        'CALIFORNIA_GIRLS': genList(bp, 'narracoes', ['CALIFORNIA_GIRLS_01', 'CALIFORNIA_GIRLS_02']),
        'COCAINE': genList(bp, 'narracoes', ['COCAINE_01', 'COCAINE_02']),
        'CRAWLING_AFTER_YOU': genList(bp, 'narracoes', ['CRAWLING_AFTER_YOU_01', 'CRAWLING_AFTER_YOU_02']),
        'FALL_IN_LINE': genList(bp, 'narracoes', ['FALL_IN_LINE_01', 'FALL_IN_LINE_02']),
        'FIRE_DOESNT_BURN_ITSELF': genList(bp, 'narracoes', ['FIRE_DOESNT_BURN_ITSELF_01', 'FIRE_DOESNT_BURN_ITSELF_02']),
        'GONE_FOR_GOOD': genList(bp, 'narracoes', ['GONE_FOR_GOOD_01', 'GONE_FOR_GOOD_02']),
        'NEXT_STOP': genList(bp, 'narracoes', ['NEXT_STOP_01', 'NEXT_STOP_02']),
        'SLEEPWALKER': genList(bp, 'narracoes', ['SLEEPWALKER_01', 'SLEEPWALKER_02']),
        'THIS_MYSTIC_DECADE': genList(bp, 'narracoes', ['THIS_MYSTIC_DECADE_01', 'THIS_MYSTIC_DECADE_02']),
        'TURN_IT_AROUND': genList(bp, 'narracoes', ['TURN_IT_AROUND_01', 'TURN_IT_AROUND_02', 'TURN_IT_AROUND_03']),
        'USED_BLOOD': genList(bp, 'narracoes', ['USED_BLOOD_01', 'USED_BLOOD_02']),
        'WET_BLANKET': genList(bp, 'narracoes', ['WET_BLANKET_01', 'WET_BLANKET_02', 'WET_BLANKET_03', 'WET_BLANKET_04']),
        'WHO_NEEDS_YOU': genList(bp, 'narracoes', ['WHO_NEEDS_YOU_01', 'WHO_NEEDS_YOU_02'])
      },
      adv: mapToPath('adv', advList),
      news: mapToPath('news', newsListSorted)
  };
};

export const getKult = () => {
    const bp = 'RADIO_34_DLC_HEI4_KULT';
    return {
      musicas: [
        { id: 'age_of_consent', name: 'AGE_OF_CONSENT', arquivo: `${bp}/musicas/AGE_OF_CONSENT.mp3`, introStart: 237689, introEnd: 1369525, finalStart: 13887493, finalEnd: 14694641, capa: `${bp}/capas/age_of_consent.jpg` },
        { id: 'alien_crime_lord', name: 'ALIEN_CRIME_LORD', arquivo: `${bp}/musicas/ALIEN_CRIME_LORD.mp3`, introStart: 222720, introEnd: 1159680, finalStart: 11268000, finalEnd: 12169920, capa: `${bp}/capas/alien_crime_lord.jpg` },
        { id: 'baby_i_love_you_so', name: 'BABY_I_LOVE_YOU_SO', arquivo: `${bp}/musicas/BABY_I_LOVE_YOU_SO.mp3`, introStart: 239847, introEnd: 1435704, finalStart: 18239556, finalEnd: 18930353, capa: `${bp}/capas/baby_i_love_you_so.jpg` },
        { id: 'cycle', name: 'CYCLE', arquivo: `${bp}/musicas/CYCLE.mp3`, introStart: 229846, introEnd: 825600, finalStart: 8206672, finalEnd: 8751840, capa: `${bp}/capas/cycle.jpg` },
        { id: 'deep', name: 'DEEP', arquivo: `${bp}/musicas/DEEP.mp3`, introStart: 252000, introEnd: 558720, finalStart: 10115040, finalEnd: 10690080, capa: `${bp}/capas/deep.jpg` },
        { id: 'down_on_the_street', name: 'DOWN_ON_THE_STREET', arquivo: `${bp}/musicas/DOWN_ON_THE_STREET.mp3`, introStart: 247200, introEnd: 714720, finalStart: 10011907, finalEnd: 10437600, capa: `${bp}/capas/down_on_the_street.jpg` },
        { id: 'drab_measure', name: 'DRAB_MEASURE', arquivo: `${bp}/musicas/DRAB_MEASURE.mp3`, introStart: 246720, introEnd: 1064160, finalStart: 12474720, finalEnd: 12810240, capa: `${bp}/capas/drab_measure.jpg` },
        { id: 'eisbar', name: 'EISBAR', arquivo: `${bp}/musicas/EISBAR.mp3`, introStart: 284343, introEnd: 643813, finalStart: 10970493, finalEnd: 12262874, capa: `${bp}/capas/eisbar.jpg` },
        { id: 'faceless', name: 'FACELESS', arquivo: `${bp}/musicas/FACELESS.mp3`, introStart: 546720, introEnd: 1047840, finalStart: 5845920, finalEnd: 6364320, capa: `${bp}/capas/faceless.jpg` },
        { id: 'four_shadows', name: 'FOUR_SHADOWS', arquivo: `${bp}/musicas/FOUR_SHADOWS.mp3`, introStart: 193049, introEnd: 452666, finalStart: 9820760, finalEnd: 10081328, capa: `${bp}/capas/four_shadows.jpg` },
        { id: 'girls_and_boys', name: 'GIRLS_AND_BOYS', arquivo: `${bp}/musicas/GIRLS_AND_BOYS.mp3`, introStart: 247955, introEnd: 508070, finalStart: 12169368, finalEnd: 13063220, capa: `${bp}/capas/girls_and_boys.jpg` },
        { id: 'going_back_to_cali', name: 'GOING_BACK_TO_CALI', arquivo: `${bp}/musicas/GOING_BACK_TO_CALI.mp3`, introStart: 267264, introEnd: 1284096, finalStart: 10278912, finalEnd: 11757568, capa: `${bp}/capas/going_back_to_cali.jpg` },
        { id: 'hard_to_explain', name: 'HARD_TO_EXPLAIN', arquivo: `${bp}/musicas/HARD_TO_EXPLAIN.mp3`, introStart: 281283, introEnd: 1534346, finalStart: 10184380, finalEnd: 10503951, capa: `${bp}/capas/hard_to_explain.jpg` },
        { id: 'human_fly', name: 'HUMAN_FLY', arquivo: `${bp}/musicas/HUMAN_FLY.mp3`, introStart: 678283, introEnd: 1598689, finalStart: 5871186, finalEnd: 6040439, capa: `${bp}/capas/human_fly.jpg` },
        { id: 'its_yours', name: 'ITS_YOURS', arquivo: `${bp}/musicas/ITS_YOURS.mp3`, introStart: 229186, introEnd: 677097, finalStart: 11549640, finalEnd: 12222933, capa: `${bp}/capas/its_yours.jpg` },
        { id: 'lft_me_lonely', name: 'LFT_ME_LONELY', arquivo: `${bp}/musicas/LFT_ME_LONELY.mp3`, introStart: 230400, introEnd: 444000, finalStart: 14496480, finalEnd: 15038880, capa: `${bp}/capas/lft_me_lonely.jpg` },
        { id: 'liebe_auf_den_ersten_blick', name: 'LIEBE_AUF_DEN_ERSTEN_BLICK', arquivo: `${bp}/musicas/LIEBE_AUF_DEN_ERSTEN_BLICK.mp3`, finalStart: 10412608, finalEnd: 10946691, capa: `${bp}/capas/liebe_auf_den_ersten_blick.jpg` },
        { id: 'many_tears_ago', name: 'MANY_TEARS_AGO', arquivo: `${bp}/musicas/MANY_TEARS_AGO.mp3`, introStart: 137892, introEnd: 359470, finalStart: 4387817, finalEnd: 4917512, capa: `${bp}/capas/many_tears_ago.jpg` },
        { id: 'nightclubbing', name: 'NIGHTCLUBBING', arquivo: `${bp}/musicas/NIGHTCLUBBING.mp3`, introStart: 231740, introEnd: 808332, finalStart: 10824043, finalEnd: 11572220, capa: `${bp}/capas/nightclubbing.jpg` },
        { id: 'on_the_level', name: 'ON_THE_LEVEL', arquivo: `${bp}/musicas/ON_THE_LEVEL.mp3`, introStart: 256062, introEnd: 1132348, finalStart: 9514159, finalEnd: 10166813, capa: `${bp}/capas/on_the_level.jpg` },
        { id: 'pool_song', name: 'POOL_SONG', arquivo: `${bp}/musicas/POOL_SONG.mp3`, introStart: 244576, introEnd: 518205, finalStart: 8638548, finalEnd: 9176346, capa: `${bp}/capas/pool_song.jpg` },
        { id: 'raga_madhuvanti', name: 'RAGA_MADHUVANTI', arquivo: `${bp}/musicas/RAGA_MADHUVANTI.mp3`, introStart: 239847, introEnd: 1137078, finalStart: 13349686, finalEnd: 14100306, capa: `${bp}/capas/raga_madhuvanti.jpg` },
        { id: 'rock_and_roll', name: 'ROCK_AND_ROLL', arquivo: `${bp}/musicas/ROCK_AND_ROLL.mp3`, introStart: 264480, introEnd: 683520, finalStart: 12438720, finalEnd: 13184160, capa: `${bp}/capas/rock_and_roll.jpg` },
        { id: 'shes_lost_control', name: 'SHES_LOST_CONTROL', arquivo: `${bp}/musicas/SHES_LOST_CONTROL.mp3`, introStart: 319529, introEnd: 932910, finalStart: 10226828, finalEnd: 10710876, capa: `${bp}/capas/shes_lost_control.jpg` },
        { id: 'so_it_goes', name: 'SO_IT_GOES', arquivo: `${bp}/musicas/SO_IT_GOES.mp3`, finalStart: 6328681, finalEnd: 6854976, capa: `${bp}/capas/so_it_goes.jpg` },
        { id: 'tainted_love', name: 'TAINTED_LOVE', arquivo: `${bp}/musicas/TAINTED_LOVE.mp3`, introStart: 133774, introEnd: 381728, finalStart: 5254340, finalEnd: 5752276, capa: `${bp}/capas/tainted_love.jpg` },
        { id: 'take_down_the_house', name: 'TAKE_DOWN_THE_HOUSE', arquivo: `${bp}/musicas/TAKE_DOWN_THE_HOUSE.mp3`, introStart: 253360, introEnd: 769538, finalStart: 8629765, finalEnd: 8833804, capa: `${bp}/capas/take_down_the_house.jpg` },
        { id: 'the_adults_are_talking', name: 'THE_ADULTS_ARE_TALKING', arquivo: `${bp}/musicas/THE_ADULTS_ARE_TALKING.mp3`, introStart: 207313, introEnd: 1047028, finalStart: 13209098, finalEnd: 14538566, capa: `${bp}/capas/the_adults_are_talking.jpg` },
        { id: 'this_is_the_day', name: 'THIS_IS_THE_DAY', arquivo: `${bp}/musicas/THIS_IS_THE_DAY.mp3`, introStart: 279588, introEnd: 868244, finalStart: 12311374, finalEnd: 13188176, capa: `${bp}/capas/this_is_the_day.jpg` },
        { id: 'too_much_money', name: 'TOO_MUCH_MONEY', arquivo: `${bp}/musicas/TOO_MUCH_MONEY.mp3`, introStart: 517333, introEnd: 999479, finalStart: 5507119, finalEnd: 6257442, capa: `${bp}/capas/too_much_money.jpg` },
        { id: 'tv_casualty', name: 'TV_CASUALTY', arquivo: `${bp}/musicas/TV_CASUALTY.mp3`, introStart: 171360, introEnd: 325440, finalStart: 6123360, finalEnd: 6747360, capa: `${bp}/capas/tv_casualty.jpg` },
        { id: 'typical_girls', name: 'TYPICAL_GIRLS', arquivo: `${bp}/musicas/TYPICAL_GIRLS.mp3`, finalStart: 9775785, finalEnd: 10411558, capa: `${bp}/capas/typical_girls.jpg` },
        { id: 'where_no_eagles_fly', name: 'WHERE_NO_EAGLES_FLY', arquivo: `${bp}/musicas/WHERE_NO_EAGLES_FLY.mp3`, introStart: 280320, introEnd: 1199616, finalStart: 9330432, finalEnd: 10459392, capa: `${bp}/capas/where_no_eagles_fly.jpg` }
      ],
      idshort: genList(bp, 'narracoes', Array.from({length:29},(_,i)=>`ID_${String(i+1).padStart(2,'0')}`)),
      idlong: genList(bp, 'narracoes', Array.from({length:7},(_,i)=>`ID_${String(i+30).padStart(2,'0')}`)),
      adkult: genList(bp, 'narracoes', [
        'KULT_AD001_AQUARIUS', 'KULT_AD002_ARIES', 'KULT_AD003_CANCER', 'KULT_AD004_CAPRICORN', 
        'KULT_AD005_GEMINI', 'KULT_AD006_LEO', 'KULT_AD007_LIBRA', 'KULT_AD008_PISCES', 
        'KULT_AD009_SAGITARIUS', 'KULT_AD010_SCORPIO', 'KULT_AD011_TAURUS', 'KULT_AD012_VIRGO'
      ]),
      solos: genList(bp, 'narracoes', Array.from({length:4},(_,i)=>`MONO_SOLO_${String(i+1).padStart(2,'0')}`)),
      general: genList(bp, 'narracoes', Array.from({length:11},(_,i)=>`GENERAL_${String(i+1).padStart(2,'0')}`)),
      timePools: {
        morning: genList(bp, 'narracoes', Array.from({length:4},(_,i)=>`MORNING_${String(i+1).padStart(2,'0')}`)),
        evening: genList(bp, 'narracoes', Array.from({length:4},(_,i)=>`EVENING_${String(i+1).padStart(2,'0')}`))
      },
      endto: {},
      introNarrations: {
        'AGE_OF_CONSENT': genList(bp, 'narracoes', ['AGE_OF_CONSENT_01', 'AGE_OF_CONSENT_02', 'AGE_OF_CONSENT_03']),
        'ALIEN_CRIME_LORD': genList(bp, 'narracoes', ['ALIEN_CRIME_LORD_01', 'ALIEN_CRIME_LORD_02', 'ALIEN_CRIME_LORD_03']),
        'BABY_I_LOVE_YOU_SO': genList(bp, 'narracoes', ['BABY_I_LOVE_YOU_SO_01', 'BABY_I_LOVE_YOU_SO_02', 'BABY_I_LOVE_YOU_SO_03', 'BABY_I_LOVE_YOU_SO_04', 'BABY_I_LOVE_YOU_SO_05']),
        'CYCLE': genList(bp, 'narracoes', ['CYCLE_01', 'CYCLE_02', 'CYCLE_03']),
        'DEEP': genList(bp, 'narracoes', ['DEEP_01', 'DEEP_02']),
        'DOWN_ON_THE_STREET': genList(bp, 'narracoes', ['DOWN_ON_THE_STREET_01', 'DOWN_ON_THE_STREET_02']),
        'DRAB_MEASURE': genList(bp, 'narracoes', ['DRAB_MEASURE_01', 'DRAB_MEASURE_02']),
        'EISBAR': genList(bp, 'narracoes', ['EISBAR_01', 'EISBAR_02', 'EISBAR_03']),
        'FACELESS': genList(bp, 'narracoes', ['FACELESS_01', 'FACELESS_02', 'FACELESS_03', 'FACELESS_04']),
        'FOUR_SHADOWS': genList(bp, 'narracoes', ['FOUR_SHADOWS_01', 'FOUR_SHADOWS_02', 'FOUR_SHADOWS_03', 'FOUR_SHADOWS_04']),
        'GIRLS_AND_BOYS': genList(bp, 'narracoes', ['GIRLS_AND_BOYS_01', 'GIRLS_AND_BOYS_02', 'GIRLS_AND_BOYS_03']),
        'HARD_TO_EXPLAIN': genList(bp, 'narracoes', ['HARD_TO_EXPLAIN_01', 'HARD_TO_EXPLAIN_02', 'HARD_TO_EXPLAIN_03']),
        'HUMAN_FLY': genList(bp, 'narracoes', ['HUMAN_FLY_01', 'HUMAN_FLY_02']),
        'ITS_YOURS': genList(bp, 'narracoes', ['ITS_YOURS_01', 'ITS_YOURS_02', 'ITS_YOURS_03']),
        'LFT_ME_LONELY': genList(bp, 'narracoes', ['LFT_ME_LONELY_01', 'LFT_ME_LONELY_02', 'LFT_ME_LONELY_03']),
        'MANY_TEARS_AGO': genList(bp, 'narracoes', ['MANY_TEARS_AGO_01', 'MANY_TEARS_AGO_02', 'MANY_TEARS_AGO_03', 'MANY_TEARS_AGO_04']),
        'NIGHTCLUBBING': genList(bp, 'narracoes', ['NIGHTCLUBBING_01', 'NIGHTCLUBBING_02']),
        'ON_THE_LEVEL': genList(bp, 'narracoes', ['ON_THE_LEVEL_01', 'ON_THE_LEVEL_02']),
        'POOL_SONG': genList(bp, 'narracoes', ['POOL_SONG_01', 'POOL_SONG_02', 'POOL_SONG_03']),
        'RAGA_MADHUVANTI': genList(bp, 'narracoes', ['RAGA_MADHUVANTI_01', 'RAGA_MADHUVANTI_02', 'RAGA_MADHUVANTI_03', 'RAGA_MADHUVANTI_04', 'RAGA_MADHUVANTI_05']),
        'ROCK_AND_ROLL': genList(bp, 'narracoes', ['ROCK_AND_ROLL_01', 'ROCK_AND_ROLL_02', 'ROCK_AND_ROLL_03']),
        'SHES_LOST_CONTROL': genList(bp, 'narracoes', ['SHES_LOST_CONTROL_01', 'SHES_LOST_CONTROL_02', 'SHES_LOST_CONTROL_03']),
        'TAINTED_LOVE': genList(bp, 'narracoes', ['TAINTED_LOVE_01', 'TAINTED_LOVE_02', 'TAINTED_LOVE_03']),
        'TAKE_DOWN_THE_HOUSE': genList(bp, 'narracoes', ['TAKE_DOWN_THE_HOUSE_01', 'TAKE_DOWN_THE_HOUSE_02', 'TAKE_DOWN_THE_HOUSE_03']),
        'THE_ADULTS_ARE_TALKING': genList(bp, 'narracoes', ['THE_ADULTS_ARE_TALKING_01', 'THE_ADULTS_ARE_TALKING_02', 'THE_ADULTS_ARE_TALKING_03']),
        'THIS_IS_THE_DAY': genList(bp, 'narracoes', ['THIS_IS_THE_DAY_01', 'THIS_IS_THE_DAY_02', 'THIS_IS_THE_DAY_03']),
        'TOO_MUCH_MONEY': genList(bp, 'narracoes', ['TOO_MUCH_MONEY_01', 'TOO_MUCH_MONEY_02', 'TOO_MUCH_MONEY_03', 'TOO_MUCH_MONEY_04']),
        'TV_CASUALTY': genList(bp, 'narracoes', ['TV_CASUALTY_01', 'TV_CASUALTY_02', 'TV_CASUALTY_03', 'TV_CASUALTY_04', 'TV_CASUALTY_05']),
        'WHERE_NO_EAGLES_FLY': genList(bp, 'narracoes', ['WHERE_NO_EAGLES_FLY_01'])
      },
      adv: [],
      news: []
    };
}; // <--- FECHA A FUNÇÃO AQUI COM PONTO E VÍRGULA

// Exportação Final (sem lixo anterior)
export default { getClassRock, getSilver, getRock, getKult };
