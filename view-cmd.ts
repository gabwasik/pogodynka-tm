import * as con from './controller.js';
import { getWeatherIcon } from "./icons.js";
import { MainMenu, Weather } from "./model.js";
import dotenv from "dotenv";
import kit from 'terminal-kit';
import { clearInterval } from "timers";
dotenv.config(); // wczytanie pliku konfiguracyjnego zawierającego wybrany typ jednostek (metryczny/imperialny)

// typ wyliczeniowy przypisujący ID podmenu do bardziej czytelnych zmiennych
enum Menu {
    Main,
    Weather,
    Settings,
    SettingsUnits,
}
// przydzielenie terminala do zmiennej
const { terminal: term} = kit;
// tablica przekładająca kody wiatrów na ikony
const windArrows: { [key: string]: string[] } = {
    ' ': [''],
    '←': ['W'],
    '↑': ['N'],
    '→': ['E'],
    '↓': ['S'],
    '↖': ['NW', 'NNW', 'WNW'],
    '↗': ['NE', 'NNE', 'ENE'],
    '↘': ['SE', 'SSE', 'ESE'],
    '↙': ['SW', 'SSW', 'WSW'],
    '≤': ['MAX'],
};

export function displaySubmenu(menuId: number, animateMainMenuLogo?: boolean, drawMainMenuInfo?: boolean): void {
    /**
     * Funkcja wyświetlająca w konsoli podmenu o danym ID.
     *
     * @param menuId - ID podmenu, które powinno zostać wyświetlone
     * @param drawMainMenuLogo - opcjonalny boolean decydujący o tym, czy logo menu głównego zostanie zaanimowane
     * @param drawMainMenuInfo - opcjonalny boolean decydujący o tym, czy napisy menu głównego zostaną wyświetlone
     */

    // instancja klasy menu głównego
    const mainMenu: MainMenu = MainMenu.getInstance();
    // tablica przechowująca pozycje podmenu na ekranie
    const position: { x: number, y: number } = mainMenu.submenusPositions[menuId];

    // jeżeli podane ID podmenu nie istnieje w typie wyliczeniowym, to wyrzucamy błąd
    if (menuId < parseInt(Object.keys(Menu)[0]) || menuId > Object.keys(Menu).length / 2) throw new Error('MenuNotFound: Menu o podanym ID nie istnieje!');

    // wyświetlenie w menu głównym nazwy aplikacji i informacji o autorze
    if (drawMainMenuInfo) {
        term.clear();
        term(con.readTextFile('./ascii/logo.txt'));
        term.moveTo(position.x, position.y - 2).blink();
        term.brightBlue('Pogodynka™ (' + ((process.env.IMPERIAL == "true") ? '°F' : '°C') + ')');
        term.move(10, 0);
        term.yellow('^y© Gabriel Wasiluk');
        term.styleReset();
    }

    // zaanimowanie logo w menu głównym
    if (animateMainMenuLogo) {
        const logo: { x: number; y: number; even: string; odd: string }[] = mainMenu.animationFrames;
        let even: boolean = true;
        if (!mainMenu.animationInterval) mainMenu.animationInterval = setInterval((): void => {
            for (let i: number = 0; i < logo.length; i++) {
                // przeniesienie kursora do miejsca danej klatki
                term.moveTo(logo[i].x, logo[i].y);

                // wyświetlanie klatek animacji na zmianę
                if (even) term(logo[i].even);
                else term(logo[i].odd);
            }

            // zmiana następnej klatki na przeciwną
            even = !even;
        }, 750);
    }

    // utworzenie interaktywnego menu
    term.hideCursor();
    con.createChoiceSubmenu(menuId, position.x, position.y);
}
export function hideSubmenu(menuId: number): void {
    /**
     * Funkcja "zamykająca" otwarte w konsoli podmenu o danym ID.
     *
     * @param menuId - ID podmenu, które ma zostać "zamknięte"
     */

    // pozycja menu głównego na ekranie
    const mainMenuPosition: { x: number, y: number } = MainMenu.getInstance().submenusPositions[Menu.Main];
    // pętla czyszcząca daną linijkę
    for (let i: number = 0; i < 42; i++) {
        // czyszczenie linijki na poziomie +1 od podstawy
        term.moveTo(mainMenuPosition.x + i, mainMenuPosition.y + 1);
        term(' ');

        // dodatkowe czyszczenie podmenu jednostek, które jest o jeden poziom głębiej
        if (menuId == Menu.SettingsUnits) {
            term.moveTo(mainMenuPosition.x + i, mainMenuPosition.y + 2);
            term(' ');
        }
    }
}
export async function displayLocationInput(positionX: number, positionY: number, weather: Weather): Promise<void> {
    /**
     * Funkcja prosząca użytkownika o wprowadzanie lokalizacji prognozy, na podstawie której ma zostać pobrana prognoza pogody.
     *
     * @param positionX - pozycja pozioma prośby
     * @param positionY - pozycja pionowa prośby
     * @param weather - instancja klasy Weather
     */

    // wyświetlenie tekstu pomocniczego przed polem tekstowym
    const prompt: string = 'Lokalizacja:';
    term.moveTo(positionX - prompt.length - 1, positionY);
    term(prompt);

    // wyłączenie animacji w menu głównym (nie lubi się z wprowadzaniem tekstu) oraz przywrócenie kursora
    const mainMenu: MainMenu = MainMenu.getInstance();
    clearInterval(mainMenu.animationInterval);
    mainMenu.animationInterval = undefined;
    term.hideCursor(false);

    // poproszenie użytkownika o wprowadzenie tekstu
    const input: string | undefined = await con.askForInput(positionX, positionY);
    // użytkownik coś wpisał i zatwierdził przyciskiem Enter
    if (input) {
        // zapisanie wprowadzonego tekstu jako lokalizacja
        weather.location = input;

        // wyświetlenie spinnera podczas pobierania danych
        term.move(2, 0);
        const spinner: kit.Terminal.AnimatedText = await term.spinner();
        // próba wyświetlenia pogody
        displayWeather(weather, true).then((errorCode: number): void => {
            // zatrzymanie spinnera po uzyskaniu danych
            spinner.animate(false);

            // kod 1006 = nie znaleziono podanej lokalizacji
            if (errorCode == 1006) {
                // wyświetlamy stosowny komunikat i prosimy użytkownika o ponowne wprowadzenie lokalizacji
                displayLocationInput(positionX, positionY, weather);
            }
        });
    } else { // użytkownik anulował wpisywanie tekstu poprzez wciśnięcie przycisku Esc
        // wyczyszczenie linijki pola tekstowego i tej do wyświetlania błędów
        term.moveTo(19, 7);
        for (let i: number = 0; i < 100; i++) term(' ');
        term.moveTo(19, 8);
        for (let i: number = 0; i < 100; i++) term(' ');

        // cofnięcie się do podmenu pogody
        displaySubmenu(Menu.Weather, true);
    }
}
let updateTimeout: any, updateInterval: any;
async function displayWeather(weather: Weather, drawUI?: boolean): Promise<number> {
    /**
     * Funkcja wyświetlająca na ekranie prognozę pogody.
     *
     * @param weather - instancja klasy Weather
     * @param drawUI - opcjonalny boolean decydujący o tym, czy funkcja ma wyświetlić UI na ekranie: true = tak, false | undefined = nie
     * @return Promise zwracający kod błędu: 0 = wyświetlono pogodę, 1 = wystąpił błąd
     */

    const currentDate: Date = new Date();
    const currentHours: number = currentDate.getHours();
    const imperial: boolean = (process.env.IMPERIAL == 'true');
    const weekly: boolean = weather.isWeekly;

    const errorCode: number = await weather.updateWeather(currentDate, weekly);
    if (errorCode == 1006) return errorCode;

    // sprawdza, czy aktualny plan API to Pro+ (generuje więcej niż trzy dni prognozy tygodniowej; przy prognozie godzinowej nie ma to znaczenia)
    const isProPlus: boolean = (weekly) ? (weather.weeklyDays > 3) : true;
    if (drawUI) { // wyświetlanie UI prognoz
        term.clear();
        term(con.readTextFile(`./ascii/${(isProPlus) ? 7 : 3}days.txt`));
    }

    // obsługa dwóch linijek tekstu pod UI prognozy
    term.moveTo(3, 15);
    term(((weekly) ? 'Prognoza tygodniowa' : 'Prognoza godzinowa') + ` dla ^W${weather.location.original}, ${weather.location.country}` + ` ^K(${ currentDate.toLocaleString("pl-PL", { dateStyle: 'medium', timeStyle: 'short' }) })`);
    term.moveTo(3, 16);
    term('Następna automatyczna aktualizacja prognozy: ');
    if (isProPlus) {
        term.gray(new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + ((weekly) ? 1 : 0),
            (weekly) ? 0 : currentHours + 1,
            0,
            0
        ).toLocaleString("pl-PL", { dateStyle: 'medium', timeStyle: 'short' }));
    } else term.gray('niedostępna');

    // wyświetlanie danych na przygotowanym UI
    let offset: number = 0;
    for (let i: number = 0; i < ((isProPlus) ? 7 : 3); i++) {
        // ikona pogody prognozy
        const icon: string[] = getWeatherIcon(weather.iconCodes[i], (weekly) ? false : !weather.timesOfDay[i]);
        for (let j: number = 0; j < icon.length; j++) {
            term.moveTo(4 + offset, 2 + j);
            term(icon[j] + '\n');
        }

        // godzina/data prognozy
        term.moveTo(3 + offset, 9);
        term(weather.timesOfForecasts[i]);

        // temperatura na zewnątrz
        let temperature: string = (imperial) ? weather.temperatures.f[i].toString() : weather.temperatures.c[i].toString();
        switch(temperature.length) {
            case 1: temperature = '  ' + temperature; break;
            case 2: temperature = ' ' + temperature; break;
        }
        term.moveTo(13 + offset, 9);
        term(temperature);

        // szansa na opady czegokolwiek (z szans na deszcz i śnieg wybierana jest najwyższa wartość)
        let precipitation: string = ((weather.chancesOf.snow[i] > weather.chancesOf.rain[i]) ? weather.chancesOf.snow[i] : weather.chancesOf.rain[i]).toString();
        switch(precipitation.length) {
            case 1: precipitation = '  ' + precipitation; break;
            case 2: precipitation = ' ' + precipitation; break;
        }
        term.moveTo(14 + offset, 11);
        term(precipitation);

        // wilgotność powietrza
        let humidity: string = weather.humidities[i].toString();
        switch(humidity.length) {
            case 1: humidity = '  ' + humidity; break;
            case 2: humidity = ' ' + humidity; break;
        }
        term.moveTo(14 + offset, 12);
        term(humidity);

        // prędkość wiatru
        let wind: string = (imperial) ? weather.winds[i].mph : weather.winds[i].kph;
        let windDirection: string | undefined = Object.keys(windArrows).find((key: string) =>
            windArrows[key].includes(weather.winds[i].dir)
        );
        switch(wind.length) {
            case 1: wind = '  ' + windDirection + ' ' + wind; break;
            case 2: wind = ' ' + windDirection + ' ' + wind; break;
        }
        term.moveTo(10 + offset, 13);
        term(wind);

        // wyświetlenie jednostek
        term.moveTo(17 + i * 16, 9);
        term((imperial) ? 'F' : 'C');
        term.moveTo(15 + i * 16, 13);
        term((imperial) ? 'm' : 'k');

        // zmiana offsetu po wyświetleniu danych
        offset += 16;
    }

    // automatyczna aktualizacja prognozy co godzinę (godzinowa) lub o północy każdego dnia (tygodniowa)
    if (isProPlus) {
        const currentMinutes: number = currentDate.getMinutes();
        const currentSeconds: number = currentDate.getSeconds();
        const time: number = 1000 * (60 - currentSeconds) + 1000 * 60 * (59 - currentMinutes) + 1000 * 60 * 60 * (23 - ((weekly) ? currentHours : 23));
        const interval: number = 1000 * 60 * 60 * ((weekly) ? 24 : 1);

        updateTimeout = setTimeout((): void => {
            displayWeather(weather, false);
            updateInterval = setInterval((): void => {
                displayWeather(weather, false);
            }, interval);
        }, time);
    }

    // wyświetlenie przycisku wracającego do menu głównego
    term.gridMenu(['   do menu   '], { x: 99, y: 16, itemMaxWidth: 15 }, (error): void => {
        if (error) throw new Error('MenuBroken: Menu o podanym ID nie mogło zostać wyświetlone!');

        clearTimeout(updateTimeout); clearInterval(updateInterval);
        displaySubmenu(Menu.Main, true, true);
    });

    return 0;
}