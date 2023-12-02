// obiekt przechowujący informacje, które prognozy wykorzystują takie same ikony
const weatherCodes: { [key: number]: number[] } = {
    1003: [1006],
    1063: [1180, 1186, 1240],
    1066: [1210, 1216, 1255],
    1069: [1198, 1201, 1249],
    1072: [1168],
    1114: [1219],
    1150: [1153],
    1183: [1189],
    1192: [1243],
    1195: [1246],
    1204: [1207],
    1222: [1258],
    1237: [1261],
    1225: [1117],
}
// obiekt zawierający wyglądy ikon dziennych
const weatherIcons: { [key: number]: string[] } = {
    0: [
        "    .-.      ",
        "     __)     ",
        "    (        ",
        "     `-’     ",
        "      •      ",
    ],

    // [0] Sunny/Clear
    1000: [
        "    ^y\\   /    ",
        "     ^y.-.     ",
        "  ^y― (   ) ―  ",
        "     ^y`-^/'     ",
        "    ^y/   \\    ",
    ],

    // [1] Partly Cloudy
    // = 1006 ([2] Cloudy)
    1003: [
        "             ",
        "  ^y`/\"\"^K.-.    ",
        " ^y‾^/,^:^y\\_^K(   ).  ",
        "   ^y/^K(___(__) ",
        "             ",
    ],

    // [3] Overcast
    1009: [
        "             ",
        "     ^K.--.    ",
        "  ^K.-(    ).  ",
        " ^K(___.__)__) ",
        "             ",
    ],

    // [4] Mist
    1030: [
        "             ",
        " ^B_ - _ - _ - ",
        "             ",
        " ^B_ - _ - _ - ",
        "             ",
    ],

    // [5] Patchy rain nearby
    // = 1180 ([18] Patchy light rain)
    // = 1186 ([20] Moderate rain at times)
    // = 1240 ([35] Light rain shower)
    1063: [
        "  ^y`/\"\"^K.-.    ",
        " ^y‾^/,^:^y\\_^K(   ).  ",
        "   ^y/^K(___(__) ",
        "    ^B‘ ‘ ‘ ‘  ",
        "   ^B‘ ‘ ‘ ‘   ",
    ],

    // [6] Patchy snow nearby
    // = 1210 ([28] Patchy light snow)
    // = 1216 ([30] Patchy moderate snow)
    // = 1255 ([40] Light snow showers)
    1066: [
        "  ^y`/\"\"^K.-.    ",
        " ^y‾^/,^:^y\\_^K(   ).  ",
        "   ^y/^K(___(__) ",
        "    ^W*  *  *  ",
        "   ^W*  *  *   ",
    ],

    // [7] Patchy sleet nearby
    // = 1198 ([24] Light freezing rain)
    // = 1201 ([25] Moderate or heavy freezing rain)
    // = 1249 ([38] Light sleet showers)
    1069: [
        "  ^y`/\"\"^K.-.    ",
        " ^y‾^/,^:^y\\_^K(   ).  ",
        "   ^y/^K(___(__) ",
        "    ^B‘ ^W* ^B‘ ^W*  ",
        "   ^W* ^B‘ ^W* ^B‘   ",
    ],

    // [9] Thundery outbreaks in nearby
    1087: [
        "  ^y`/\"\"^K.-.    ",
        " ^y‾^/,^:^y\\_^K(   ).  ",
        "   ^y/^K(___(__) ",
        "    ^y⚡   ^y⚡    ",
        "       ^y⚡     ",
    ],

    // [12] Fog
    1135: [
        "             ",
        " ^B_ - _ - _ - ",
        "  ^B_ - _ - _  ",
        " ^B_ - _ - _ - ",
        "             ",
    ],

    // [13] Freezing fog
    1147: [
        "             ",
        " ^B_ ^W* ^B_ - _ ^W* ",
        "  ^B_ - ^W* ^B- _  ",
        " ^W* ^B- _ - ^W* ^B- ",
        "             ",
    ],

    // [14] Patchy light drizzle
    // = 1153 ([15] Light drizzle)
    1150: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        "   ^B‘ ‘ ‘ ‘   ",
        "             ",
    ],

    // [8] Patchy freezing drizzle nearby
    // = 1168 ([16] Freezing drizzle)
    1072: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        "   ^B‘ ^W* ^B‘ ^W*   ",
        "             ",
    ],

    // [17] Heavy freezing drizzle
    1171: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        " ^B‘ ^W* ^B‘ ^W* ^B‘ ^W* ",
        "             ",
    ],

    // [19] Light rain
    // = 1189 ([21] Moderate rain)
    1183: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        "   ^B‘ ‘ ‘ ‘   ",
        "  ^B‘ ‘ ‘ ‘    ",
    ],

    // [23] Heavy rain
    // = 1246 ([37] Torrential rain shower)
    1195: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        "  ^B‚‘‚‘‚‘‚‘   ",
        "  ^B‚’‚’‚’‚’   ",
    ],

    // [22] Heavy rain at times
    // = 1243 ([36] Moderate or heavy rain shower)
    1192: [
        "  ^y`/\"\"^K.-.    ",
        " ^y‾^/,^:^y\\_^K(   ).  ",
        "   ^y/^K(___(__) ",
        "   ^B‚‘‚‘‚‘‚‘  ",
        "   ^B‚’‚’‚’‚’  ",
    ],

    // [26] Light sleet
    // = 1207 ([27] Moderate or heavy sleet)
    1204: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        "   ^B‘ ^W* ^B‘ ^W*   ",
        "  ^W* ^B‘ ^W* ^B‘    ",
    ],

    // [29] Light snow
    1213: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        "   ^W*  *  *   ",
        "             ",
    ],

    // [10] Blowing snow
    // = 1219 ([31] Moderate snow)
    1114: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        "   ^W*  *  *   ",
        "  ^W*  *  *    ",
    ],

    // [32] Patchy heavy snow
    // = 1258 ([41] Moderate or heavy snow showers)
    1222: [
        "  ^y`/\"\"^K.-.    ",
        " ^y‾^/,^:^y\\_^K(   ).  ",
        "   ^y/^K(___(__) ",
        "    * * * *  ",
        "   * * * *   ",
    ],

    // [33] Heavy snow
    // = 1117 ([11] Blizzard)
    1225: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        "   ^W* * * *   ",
        "  ^W* * * *    ",
    ],

    // [34] Ice pellets
    // = 1261 ([42] Light showers of ice pellets)
    1237: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        "    ^W●   ●    ",
        "             ",
    ],

    // [39] Moderate or heavy sleet showers
    1252: [
        "  ^y`/\"\"^K.-.    ",
        " ^y‾^/,^:^y\\_^K(   ).  ",
        "   ^y/^K(___(__) ",
        "  ^B‘ ^W* ^B‘‘ ^W* ^B‘ ",
        "  ^W* ^B‘‘ ^W* ^B‘‘  ",
    ],

    // [43] Moderate or heavy showers of ice pellets
    1264: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        "    ^W●   ●    ",
        "   ^W●   ●     ",
    ],

    // [44] Patchy light rain in area with thunder
    1273: [
        "  ^y`/\"\"^K.-.    ",
        " ^y‾^/,^:^y\\_^K(   ).  ",
        "   ^y/^K(___(__) ",
        "    ^y⚡^B‘‘  ^y⚡^B‘‘ ",
        "    ^B‘ ^B‘ ^B‘ ^B‘  ",
    ],

    // [45] Moderate or heavy rain in area with thunder
    1276: [
        "     ^K.-.     ",
        "    ^K(   ).   ",
        "   ^K(___(__)  ",
        "  ^B‚‘^y⚡ ^B‘‚^y⚡ ^B‚‘ ",
        " ^B‚’ ^B‚’^y⚡ ^B’‚’  ",
    ],

    // [46] Patchy light snow in area with thunder
    1279: [
        "  ^y`/\"\"^K.-.    ",
        " ^y‾^/,^:^y\\_^K(   ).  ",
        "   ^y/^K(___(__) ",
        "    ^W*^y⚡ ^W* ^y⚡^W*  ",
        "   ^W*  *  *   ",
    ],

    // [47] Moderate or heavy snow in area with thunder
    1282: [
        "  ^y`/\"\"^K.-.    ",
        " ^y‾^/,^:^y\\_^K(   ).  ",
        "   ^y/^K(___(__) ",
        "    ^W*^y⚡^W*  ^W*^y⚡^W* ",
        "   ^W* *  * *  ",
    ],
};
// obiekt zawierający wyglądy ikon nocnych (niektóre pochodzą z ikon dziennych)
const weatherIconsNight: { [key: number]: string[] } = {
    // [0] Sunny/Clear
    1000: [
        "    ^W,---.   ",
        "   ^W/   /    ",
        "  ^W|    \\    ",
        "   ^W\\    \\   ",
        "    ^W`----' ",
    ],

    // [1] Partly Cloudy
    // = 1006 ([2] Cloudy)
    1003: [
        "   ^W/‾|      ",
        "  ^W|  \\^K.-.    ",
        "   ^W\\_^K(   ).  ",
        "    ^K(___(__) ",
        "             ",
    ],

    // [5] Patchy rain nearby
    // = 1180 ([18] Patchy light rain)
    // = 1186 ([20] Moderate rain at times)
    // = 1240 ([35] Light rain shower)
    1063: [
        "   ^W/‾|      ",
        "  ^W|  \\^K.-.    ",
        "   ^W\\_^K(   ).  ",
        "    ^B‘ ‘ ‘ ‘  ",
        "   ^B‘ ‘ ‘ ‘   ",
    ],

    // [6] Patchy snow nearby
    // = 1210 ([28] Patchy light snow)
    // = 1216 ([30] Patchy moderate snow)
    // = 1255 ([40] Light snow showers)
    1066: [
        "   ^W/‾|      ",
        "  ^W|  \\^K.-.    ",
        "   ^W\\_^K(   ).  ",
        "    ^W*  *  *  ",
        "   ^W*  *  *   ",
    ],

    // [7] Patchy sleet nearby
    // = 1198 ([24] Light freezing rain)
    // = 1201 ([25] Moderate or heavy freezing rain)
    // = 1249 ([38] Light sleet showers)
    1069: [
        "   ^W/‾|      ",
        "  ^W|  \\^K.-.    ",
        "   ^W\\_^K(   ).  ",
        "    ^B‘ ^W* ^B‘ ^W*  ",
        "   ^W* ^B‘ ^W* ^B‘   ",
    ],

    // [9] Thundery outbreaks in nearby
    1087: [
        "   ^W/‾|      ",
        "  ^W|  \\^K.-.    ",
        "   ^W\\_^K(   ).  ",
        "    ^y⚡   ^y⚡    ",
        "       ^y⚡     ",
    ],

    // [22] Heavy rain at times
    // = 1243 ([36] Moderate or heavy rain shower)
    1192: [
        "   ^W/‾|      ",
        "  ^W|  \\^K.-.    ",
        "   ^W\\_^K(   ).  ",
        "   ^B‚‘‚‘‚‘‚‘  ",
        "   ^B‚’‚’‚’‚’  ",
    ],

    // [32] Patchy heavy snow
    // = 1258 ([41] Moderate or heavy snow showers)
    1222: [
        "   ^W/‾|      ",
        "  ^W|  \\^K.-.    ",
        "   ^W\\_^K(   ).  ",
        "    * * * *  ",
        "   * * * *   ",
    ],

    // [39] Moderate or heavy sleet showers
    1252: [
        "   ^W/‾|      ",
        "  ^W|  \\^K.-.    ",
        "   ^W\\_^K(   ).  ",
        "  ^B‘ ^W* ^B‘‘ ^W* ^B‘ ",
        "  ^W* ^B‘‘ ^W* ^B‘‘  ",
    ],

    // [44] Patchy light rain in area with thunder
    1273: [
        "   ^W/‾|      ",
        "  ^W|  \\^K.-.    ",
        "   ^W\\_^K(   ).  ",
        "    ^y⚡^B‘‘  ^y⚡^B‘‘ ",
        "    ^B‘ ^B‘ ^B‘ ^B‘  ",
    ],

    // [46] Patchy light snow in area with thunder
    1279: [
        "   ^W/‾|      ",
        "  ^W|  \\^K.-.    ",
        "   ^W\\_^K(   ).  ",
        "    ^W*^y⚡ ^W* ^y⚡^W*  ",
        "   ^W*  *  *   ",
    ],

    // [47] Moderate or heavy snow in area with thunder
    1282: [
        "   ^W/‾|      ",
        "  ^W|  \\^K.-.    ",
        "   ^W\\_^K(   ).  ",
        "    ^W*^y⚡^W*  ^W*^y⚡^W* ",
        "   ^W* *  * *  ",
    ],

    0: weatherIcons[0],       // [0] Unknown
    1009: weatherIcons[1009], // [3] Overcast
    1030: weatherIcons[1030], // [4] Mist
    1072: weatherIcons[1072], // [8] Patchy freezing drizzle nearby
    1135: weatherIcons[1135], // [12] Fog
    1147: weatherIcons[1147], // [13] Freezing fog
    1150: weatherIcons[1150], // [14] Patchy light drizzle // = 1153 ([15] Light drizzle)
    1171: weatherIcons[1171], // [17] Heavy freezing drizzle
    1183: weatherIcons[1183], // [19] Light rain // = 1189 ([21] Moderate rain)
    1195: weatherIcons[1195], // [23] Heavy rain // = 1246 ([37] Torrential rain shower)
    1204: weatherIcons[1204], // [26] Light sleet // = 1207 ([27] Moderate or heavy sleet)
    1213: weatherIcons[1213], // [29] Light snow
    1114: weatherIcons[1114], // [31] Moderate snow
    1225: weatherIcons[1225], // [33] Heavy snow
    1237: weatherIcons[1237], // [34] Ice pellets // = 1261 ([42] Light showers of ice pellets)
    1264: weatherIcons[1264], // [43] Moderate or heavy showers of ice pellets
    1276: weatherIcons[1276], // [45] Moderate or heavy rain in area with thunder
};

export function getWeatherIcon(weatherCode: number, nightVersion?: boolean): string[] {
    /**
     * Funkcja zwracająca tablicę z częściami ikony pogody o podanym kodzie.
     *
     * @param weatherCode - kod ikony, której wygląd ma zostać zwrócony
     * @param nightVersion - opcjonalny boolean decydujący o tym, która wersja ikony zostanie zwrócona: true = nocna, false | undefined = dzienna
     * @returns Tablica zawierająca pięć ciągów znaków, z których buduje się ikonę
     */

    // brak kodu ikony w zbiorze ikon dziennych
    if (!(weatherCode in weatherIcons)) {
        // wyszukanie kodu w tablicy ze wszystkimi kodami
        let index: any = Object.keys(weatherCodes).find((key: string) =>
            weatherCodes[parseInt(key)].includes(weatherCode)
        );

        // jeżeli go tam znaleziono, to zwracamy proszoną ikonę, a jeżeli nie, to ikonę z niewiadomą prognozą
        if (index) return (nightVersion) ? weatherIconsNight[index] : weatherIcons[index];
        return weatherIcons[0];
    }

    // kod ikony znaleziony w zbiorze ikon dziennych
    return (nightVersion) ? weatherIconsNight[weatherCode] : weatherIcons[weatherCode];
}