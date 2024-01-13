import { MainMenu, TextInput, Weather } from "./model.js";
import * as cmd from './view-cmd.js';
import * as gui from './view-gui.js'
import * as fs from 'fs';
import fetch from "node-fetch";
import kit from "terminal-kit";
import { clearInterval } from "timers";

/** Zmienna wprowadzona przez użytkownika, decydująca o trybie, w którym aplikacja powinna być wyświetlana (0 = tekstowy, 1 = graficzny). */
const mode: number = parseInt(process.argv[2]);
/** Zmienna reprezentująca plik odpowiadający za wyświetlanie aplikacji ({@link cmd} = tekstowy, {@link gui} = graficzny). */
const app = (!mode || mode == 0) ? cmd : gui;
// przypisanie okna konsoli do zmiennej
const { terminal: term } = kit;

// zdarzenie uruchamiane po wciśnięciu klawisza na klawiaturze lub ich kombinacji
term.on('key', (name: string): void => {
    // zakończenie aplikacji po wykryciu skrótu klawiszowego Ctrl+C
    if (name == 'CTRL_C') term.processExit(0);
})

function main(): void {
    /**
     * Główna funkcja aplikacji.
     */
    app.displaySubmenu(0, true, true);
}
export async function askForInput(positionX: number, positionY: number): Promise<string | undefined> {
    /**
     * Funkcja prosząca użytkownika o wprowadzenie ciągu znaków.
     *
     * @param positionX - pozycja pozioma pola tekstowego
     * @param positionY - pozycja pionowa pola tekstowego
     * @returns Promise z wprowadzonym przez użytkownika ciągiem znaków lub symbol undefined (użytkownik anulował wpisywanie tekstu)
     */

    // instancja klasy pola tekstowego
    const textInput: TextInput = TextInput.getInstance();
    // ciąg znaków do zwrócenia
    let inputReturn = undefined;

    // stworzenie pola tekstowego
    await term.inputField({
        // @ts-ignore (nie rozpoznaje x jako opcji, mimo że działa ona poprawnie)
        x: positionX,
        y: positionY,
        minLength: 1,
        cancelable: true,
        default: textInput.lastInput,
        style: term.brightWhite()
    }).promise.then((input: string | undefined) => {
        // użytkownik wypełnił pole tekstowe i zatwierdził tekst przyciskiem Enter
        if (input) {
            textInput.lastInput = inputReturn = input;
        }
    });

    // zwrócenie wprowadzonego ciągu znaków (lub symbolu undefined)
    return inputReturn;
}
export async function fetchWeatherDataFromAPI(location: string, date: Date, isWeekly?: boolean): Promise<any> {
    /**
     * Funkcja pobierająca dane pogodowe z API.
     *
     * @param location - miejsce, którego ma dotyczyć prognoza
     * @param date - data prognozy, która ma zostać pobrana
     * @param isWeekly - opcjonalny boolean definiujący typ prognozy: true = tygodniowa, false | undefined = godzinowa
     * @returns Promise z danymi pogodowymi lub symbol undefined (błąd pobierania danych)
     */

        // aktualna godzina systemowa
    const currentHour: number = date.getHours();
    // ilość dni prognozy do pobrania
    const fetchDays: number = (isWeekly) ? 8 : ((currentHour > 17) ? 2 : 1);
    // obiekt pomocniczy reprezentujący prognozy pogody
    const weatherData: {
        chancesOf: { [key: string]: number[] },
        humidities: number[],
        iconCodes: number[],
        iconUrls: string[],
        location: { [key: string]: string },
        temperatures: { [key: string]: number[] },
        timesOfDay: string[],
        timesOfForecasts: number[],
        winds: { kph: string, mph: string, dir: string }[],
        weeklyDays: number,
    } = {
        chancesOf: { rain: [], snow: [] },
        humidities: [],
        iconCodes: [],
        iconUrls: [],
        location: { original: '', normalized: '', country: '' },
        temperatures: { c: [], f: [] },
        timesOfDay: [],
        timesOfForecasts: [],
        winds: [],
        weeklyDays: 0,
    };

    // pobranie danych z API
    const response= await fetch(`https://api.weatherapi.com/v1/forecast.json
        ?key=${process.env.WEATHERAPI_KEY}
        &q=${location}
        &days=${fetchDays}
        &aqi=no
        &alerts=no`);
    const data: any = await response.json();
    // wychwycenie kodów błędów
    if (data['error']) return data['error']['code'];

    // zapisanie nazw lokalizacji oraz kraju prognozy
    weatherData.location.original = data['location']['name'];
    weatherData.location.normalized = normalizeString(weatherData.location.original);
    weatherData.location.country = data['location']['country'];

    // obiekt reprezentujący prognozę
    let forecast: any;
    // rozpoczęcie pobierania danych o prognozach
    if (isWeekly) { // prognoza tygodniowa
        // data reprezentująca aktualnie pobieraną prognozę
        const forecastDateTemp: Date = new Date(date);
        // jeżeli mamy północ, to pobieramy od nowego dnia
        const nextDay: number = (forecastDateTemp.getHours() == 0 && forecastDateTemp.getMinutes() == 0) ? 1 : 0;
        for (let i: number = 0; i < fetchDays; i++) {
            if (data['forecast']['forecastday'][i + nextDay]) forecast = data['forecast']['forecastday'][i + nextDay]['day'];
            else return weatherData;

            // dodanie wiodących zer do dni i miesięcy
            let day: string = forecastDateTemp.getDate().toString();
            let month: string = (forecastDateTemp.getMonth() + 1).toString();
            if (day.length == 1) day = '0' + day;
            if (month.length == 1) month = '0' + month;

            // zapisanie pobranych danych
            weatherData.chancesOf.rain.push(forecast['daily_chance_of_rain']);
            weatherData.chancesOf.snow.push(forecast['daily_chance_of_snow']);
            weatherData.iconCodes.push(parseInt(forecast['condition']['code']));
            weatherData.iconUrls.push('https:' + forecast['condition']['icon'].replace('64x64', '128x128'));
            weatherData.timesOfDay.push(day + '.' + month);
            weatherData.humidities.push(forecast['avghumidity']);
            weatherData.temperatures.c.push(Math.round(forecast['avgtemp_c']));
            weatherData.temperatures.f.push(Math.round(forecast['avgtemp_f']));
            weatherData.winds.push({
                kph: Math.round(forecast['maxwind_kph']).toString(),
                mph: Math.round(forecast['maxwind_mph']).toString(),
                dir: 'MAX',
            });

            // zwiększenie licznika prognoz oraz zmiana dnia pobieranej prognozy na kolejny
            weatherData.weeklyDays = weatherData.weeklyDays + 1;
            forecastDateTemp.setDate(forecastDateTemp.getDate() + 1);
        }
    } else { // prognoza godzinowa
        // dzisiejsza prognoza pogody
        const weatherToday: object[] = data['forecast']['forecastday'][0]['hour'];
        // jutrzejsza prognoza pogody (jeżeli jest po 17:00)
        const weatherTomorrow: object[] = (currentHour > 17) ? data['forecast']['forecastday'][1]['hour'] : undefined;

        let forecastHourTemp: number = currentHour; // godzina reprezentująca aktualnie pobieraną prognozę
        for (let i: number = 0; i < 7; i++) {
            if (forecastHourTemp >= 24) { // po przejściu z 23:00 na 00:00
                // ustawienie aktualnej godziny na północ
                forecastHourTemp = 0;
                // pobranie prognozy jutrzejszej
                forecast = weatherTomorrow[forecastHourTemp];
            } else { // przed północą
                // pobranie prognozy dzisiejszej
                forecast = weatherToday[forecastHourTemp];
            }

            // dodanie zera wiodącego do godziny
            let hour: string = forecastHourTemp.toString();
            if (hour.length == 1) hour = '0' + hour;

            // zapisanie pobranych danych
            weatherData.chancesOf.rain.push(forecast['chance_of_rain']);
            weatherData.chancesOf.snow.push(forecast['chance_of_snow']);
            weatherData.iconCodes.push(parseInt(forecast['condition']['code']));
            weatherData.iconUrls.push('https:' + forecast['condition']['icon'].replace('64x64', '128x128'));
            weatherData.timesOfDay.push(hour);
            weatherData.humidities.push(forecast['humidity']);
            weatherData.temperatures.c.push(Math.round(forecast['temp_c']));
            weatherData.temperatures.f.push(Math.round(forecast['temp_f']));
            weatherData.timesOfForecasts.push(parseInt(forecast['is_day']));
            weatherData.winds.push({
                kph: Math.round(forecast['wind_kph']).toString(),
                mph: Math.round(forecast['wind_mph']).toString(),
                dir: forecast['wind_dir'],
            });

            // zmiana godziny pobieranej prognozy na kolejną
            forecastHourTemp++;
        }
    }

    // zwrócenie danych pogodowych po zakończeniu ich pakowania
    return weatherData;
}
export function createChoiceSubmenu(subMenuId: number, positionX: number, positionY: number): void {
    /**
     * Funkcja przekazująca widokowi informację, które podmenu trzeba teraz wyświetlić.
     *
     * @param subMenuId - ID podmenu, które ma zostać wyświetlone
     * @param positionX - pozycja pozioma, w której podmenu ma zostać wyświetlone
     * @param positionY - pozycja pionowa, w której podmenu ma zostać wyświetlone
     */

    // brak klucza API w pliku konfiguracyjnym
    if (process.env.WEATHERAPI_KEY == '') {
        term.moveTo(positionX, positionY).red('Nie znaleziono klucza API!');
        term.moveTo(positionX, positionY+2).yellow('Otwórz plik .env, w pierwszej linijce');
        term.moveTo(positionX, positionY+3).yellow('wklej klucz pomiędzy puste cudzysłowy,');
        term.moveTo(positionX, positionY+4).yellow('a następnie ponownie uruchom aplikację.');
        setTimeout(() => {
            term.processExit(3);
        }, 750);
        return;
    }

    // instancja klasy podmenu głównego
    const mainMenu: MainMenu = MainMenu.getInstance();
    // typ wyliczeniowy przypisujący ID podmenu do bardziej czytelnych zmiennych
    enum Menu {
        Main,
        Weather,
        Settings,
        SettingsUnits,
    }

    // stworzenie interaktywnego menu
    term.gridMenu(mainMenu.submenus[subMenuId], { x: positionX, y: positionY }, (error, response: kit.Terminal.GridMenuResponse): void => {
        // zresetowanie stylu terminala po utworzeniu animacji
        term('^:');

        // wyłapanie błędów menu
        if (error) throw new Error('MenuBroken: Menu o podanym ID nie mogło zostać wyświetlone!');

        // indeks zatwierdzonej przez użytkownika opcji
        const i: number = response.selectedIndex;
        switch(subMenuId) {
            // podmenu główne
            case 0: {
                // POGODA
                if (i == 0) app.displaySubmenu(Menu.Weather);
                // USTAWIENIA
                else if (i == 1) app.displaySubmenu(Menu.Settings);
                // KONIEC
                else if (i == 2) {
                    // zatrzymanie animacji logo, wyczyszczenie konsoli oraz zakończenie aplikacji
                    clearInterval(mainMenu.animationInterval);
                    term.clear();
                    term.processExit(0);
                }
                break;
            }
            // pogoda
            case 1: {
                // dzisiejsza
                if (i == 0) {
                    term.moveTo(positionX, positionY+2);
                    app.displayLocationInput(new Weather(false), positionX+13, positionY+2).then();
                }
                // tygodniowa
                else if (i == 1) {
                    term.moveTo(positionX+14, positionY+2);
                    app.displayLocationInput(new Weather(true), positionX+27, positionY+2).then();
                }
                // powrót
                else if (i == 2) {
                    // schowanie podmenu pogody i powrót do podmenu głównego
                    app.hideSubmenu(Menu.Weather);
                    app.displaySubmenu(Menu.Main);
                }
                break;
            }
            // ustawienia
            case 2: {
                // system jedn.
                if (i == 0) app.displaySubmenu(Menu.SettingsUnits);
                // powrót
                else if (i == 1) {
                    app.hideSubmenu(Menu.Settings);
                    app.displaySubmenu(Menu.Main);
                }
                break;
            }
            // system jedn.
            case 3: {
                // zmiana jednostek na metryczne
                if (i == 0) process.env.IMPERIAL = 'false';
                // zmiana jednostek na imperialne
                else if (i == 1) process.env.IMPERIAL = 'true';

                // podmiana jednostki temperatury w tytule oraz powrót do podmenu głównego
                const menuSubPos: { x: number, y: number }[] = mainMenu.submenusPositions;
                term.moveTo(menuSubPos[Menu.Main].x + 13, menuSubPos[Menu.Main].y - 2).blink();
                term.brightBlue((process.env.IMPERIAL == "true") ? 'F' : 'C').styleReset();
                app.hideSubmenu(Menu.SettingsUnits);
                app.displaySubmenu(Menu.Main);
                break;
            }
        }
    });
}
export function normalizeString(input: string): string {
    /**
     * Metoda normalizująca wprowadzony tekst oraz usuwająca z niego znaki diakrytyczne.
     *
     * @param input - ciąg znaków, który ma zostać znormalizowany
     * @return Ciąg znaków po normalizacji
     */

    return input.replace('ł', 'l')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '');
}
export function readTextFile(filePath: string): string | undefined {
    /**
     * Funkcja pobierająca zawartość pliku tekstowego.
     *
     * @param filePath - ścieżka pliku tekstowego
     * @returns Ciąg znaków zawierający zawartość pliku lub symbol undefined (błąd przy pobieraniu zawartości)
     */

    if (filePath.endsWith('.txt')) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (e) {
            console.error(e);
        }
    }
}

// uruchomienie aplikacji
main();