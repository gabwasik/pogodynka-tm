import { fetchWeatherDataFromAPI, normalizeString } from "./controller.js";
import dotenv from 'dotenv';
dotenv.config(); // wczytaniu pliku konfiguracyjnego zawierającego kod API

// klasa reprezentująca widok menu głównego
export class MainMenu {
    private static instance: MainMenu; // instancja klasy menu
    private _offsetX: number = 4; // offset menu w pozycji poziomej
    private _animationInterval: any; // animacja wyświetlanego logo w postaci ID interwału
    private _animationFrames: { x: number, y: number, even: string, odd: string }[] = [
        { x: 6 + this._offsetX, y: 2, even: '^y⎹', odd: '  ' },
        { x: 3 + this._offsetX, y: 3, even: '^y\\  ⎹', odd: '   ^y⎹' },
        { x: this._offsetX, y: 5, even: '^y‾‾', odd: '  ' },
        { x: 3 + this._offsetX, y: 6, even: '^y/', odd: ' ' },
        { x: 5 + this._offsetX, y: 7, even: ' ^B‘ ‘ ‘ ‘ ', odd: '^B‘ ‘ ‘ ‘ ‘' },
        { x: 5 + this._offsetX, y: 8, even: '^B‘ ‘ ‘ ‘ ‘', odd: ' ^B‘ ‘ ‘ ‘ ' },
    ]; // klatki wykorzystywane do animacji
    private _submenus: string[][] = [
        ['   POGODA   ', ' USTAWIENIA ', '   KONIEC   '],
        [' dzisiejsza ', ' tygodniowa ', '   powrót   '],
        ['system jedn.', '   powrót   '],
        ['  °C / kph  ', '  °F / mph  '],
    ]; // rodzaje interaktywnych podmenu
    private _submenusPositions: { x: number, y: number }[] = [
        { x: 19 + this._offsetX, y: 4 },
        { x: 19 + this._offsetX, y: 5 },
        { x: 33 + this._offsetX, y: 5 },
        { x: 33 + this._offsetX, y: 6 },
    ]; // pozycje interaktywnych podmenu

    get animationInterval(): any {
        return this._animationInterval;
    }
    get animationFrames(): { x: number; y: number; even: string; odd: string }[] {
        return this._animationFrames;
    }
    get submenus(): string[][] {
        return this._submenus;
    }
    get submenusPositions(): { x: number, y: number }[] {
        return this._submenusPositions;
    }
    set animationInterval(value: any) {
        this._animationInterval = value;
    }

    public static getInstance(): MainMenu {
        if (!this.instance) this.instance = new MainMenu();
        return this.instance;
    }
}
// klasa reprezentująca interaktywne pole tekstowe
export class TextInput {
    private static instance: TextInput; // instancja klasy pola
    private _lastInput: string = ''; // ostatnia wartość pola

    get lastInput(): string {
        return this._lastInput;
    }
    set lastInput(value: string) {
        this._lastInput = value;
    }

    public static getInstance(): TextInput {
        if (!this.instance) this.instance = new TextInput();
        return this.instance;
    }
}
// klasa reprezentująca 7 prognoz godzinowych/tygodniowych
export class Weather {
    private readonly _isWeekly: boolean = false; // wartość logiczna mówiąca o typie prognozy: true = godzinowa, false = tygodniowa
    private _location: { [key: string]: string } = {
        original: '',
        normalized: '',
        country: '',
    }; // nazwa lokalizacji oraz jej kraj
    private _chancesOf: { [key: string]: number[] } = {
        rain: [],
        snow: [],
    }; // szanse na opady
    private _humidities: number[] = []; // wilgotności powietrza
    private _iconCodes: number[] = []; // kody ikon pogody
    private _iconUrls: string[] = []; // linki do ikon rastrowych
    private _temperatures: { [key: string]: number[] } = {
        c: [],
        f: [],
    }; // temperatury Celsjusza i Fahrenheita
    private _timesOfDay: number[] = []; // wskaźniki mówiące, jaką ikonę pogody pokazać – dzienną (1) czy nocną (0)
    private _timesOfForecasts: string[] = []; // daty/godziny prognoz
    private _winds: { kph: string, mph: string, dir: string }[] = []; // prędkości wiatrów
    private _weeklyDays: number = 0; // liczba pobranych prognoz w przypadku prognozy tygodniowej

    get chancesOf(): { [key: string]: number[] } {
        return this._chancesOf;
    }
    get humidities(): number[] {
        return this._humidities;
    }
    get iconCodes(): number[] {
        return this._iconCodes;
    }
    get iconUrls(): string[] {
        return this._iconUrls;
    }
    get isWeekly(): boolean {
        return this._isWeekly;
    }
    get location(): { [key: string]: string } {
        return this._location;
    }
    get temperatures(): { [key: string]: number[] } {
        return this._temperatures;
    }
    get timesOfDay(): number[] {
        return this._timesOfDay;
    }
    get timesOfForecasts(): string[] {
        return this._timesOfForecasts;
    }
    get winds(): { kph: string, mph: string, dir: string }[] {
        return this._winds;
    }
    get weeklyDays(): number {
        return this._weeklyDays;
    }
    set location(name: string) {
        this._location.original = name;
        this._location.normalized = normalizeString(name);
    }

    constructor(isWeekly: boolean, location?: string) {
        if (isWeekly) this._isWeekly = true;
        // zapis lokalizacji i jej normalizacji (api nie rozpoznaje znaków diakrytycznych)
        if (location) {
            this._location.original = location;
            this._location.normalized = normalizeString(location);
        }
    }

    async updateWeather(date: Date, isWeekly?: boolean): Promise<number> {
        /**
         * Metoda wywołująca z kontrolera metodę pobierającą dane pogodowe z API.
         *
         * @param date - data, na podstawie której ma zostać przygotowana prognoza
         * @param isWeekly - opcjonalny boolean definiujący typ prognozy: true = tygodniowa, false | undefined = godzinowa
         * @returns Promise z liczbą: 0 = dane pobrano pomyślnie, 1 = wystąpił błąd
         */

        return await fetchWeatherDataFromAPI(this._location.normalized, date, isWeekly).then((data): number => {
            // jakiś błąd przy pobieraniu danych
            if (typeof data == "number") return data;

            // zapisanie pobranych danych
            this._location = data.location;
            this._chancesOf = data.chancesOf;
            this._humidities = data.humidities;
            this._iconCodes = data.iconCodes;
            this._iconUrls = data.iconUrls;
            this._temperatures = data.temperatures;
            this._timesOfDay = data.timesOfForecasts;
            this._timesOfForecasts = data.timesOfDay;
            this._winds = data.winds;
            this._weeklyDays = data.weeklyDays;

            // 0 = brak błędu
            return 0;
        });
    }
}