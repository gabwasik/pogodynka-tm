import {Weather} from './model.js';
import {
    AlignmentFlag,
    FlexLayout,
    QAction, QFont,
    QIcon,
    QLabel,
    QLineEdit,
    QMainWindow,
    QMenu,
    QMenuBar,
    QMovie,
    QPixmap,
    QPoint,
    QPushButton,
    QSize,
    QWidget
} from '@nodegui/nodegui';
import axios, {AxiosResponse} from 'axios';
import dotenv from 'dotenv';
import path from "path";

/** Bezwzględna ścieżka do katalogu zawierającego uruchamiany moduł. */
const __dirname: string = path.dirname(import.meta.url.replace('file:///', '').replace('%20', ' '));
/** Główne okno aplikacji. */
const win: QMainWindow = new QMainWindow();
/** Ciało okna aplikacji. */
let bodyWidget: QWidget;
/** Napis w menu głównym zawierający tytuł aplikacji. */
let mainWidgetInfoName: QLabel = new QLabel();
/** Napis przechowujący lokalizację ostatnio pobieranej prognozy. */
let lastLocationName: string = '';

dotenv.config();
win.setFixedSize(1100, 400);
win.setWindowIcon(new QIcon('./media/logo.png'));
win.setWindowTitle('Pogodynka™');

export async function displayLocationInput(weather: Weather): Promise<number> {
    const locationWidget: QWidget = new QWidget();
    locationWidget.setObjectName('locationWidget');
    locationWidget.setLayout(new FlexLayout());
    win.setCentralWidget(locationWidget);

        /** Pole tekstowe do wprowadzenia lokalizacji. */
        const locationText: QLineEdit = new QLineEdit();
        locationText.setObjectName('locationText');
        locationText.setText(lastLocationName);
        locationText.setPlaceholderText('Lokalizacja');
        locationWidget.layout()?.addWidget(locationText);

        /** Zbiór przycisków dialogu pytającego o lokalizację. */
        const locationButtons: QWidget = new QWidget();
        locationButtons.setObjectName('locationButtons');
        locationButtons.setLayout(new FlexLayout());
        locationWidget.layout()?.addWidget(locationButtons);

            /** Przycisk "Szukaj" dialogu pytającego o lokalizację. */
            const locationButtonSearch: QPushButton = new QPushButton();
            locationButtonSearch.setObjectName('locationButtonSearch');
            locationButtonSearch.setText('Szukaj');
            locationButtons.layout()?.addWidget(locationButtonSearch);

            /** Przycisk "Anuluj" dialogu pytającego o lokalizację. */
            const locationButtonCancel: QPushButton = new QPushButton();
            locationButtonCancel.setObjectName('locationButtonCancel');
            locationButtonCancel.setText('Anuluj');
            locationButtons.layout()?.addWidget(locationButtonCancel);

    locationText.setFocus();
    locationWidget.setStyleSheet(`
        #locationWidget {
            flex: 1;
            flex-direction: column;
            background-color: white;
            padding: 150px;
        }
            #locationText {
                flex: 1;
                color: #212529;
                font-size: 24px;
                margin: 0 100px;
                background-color: white;
            }
            #locationButtons {
                flex: 1;
                flex-direction: row;
                padding-left: 280px;
            }
                #locationButtonSearch, #locationButtonCancel {
                    flex: 1;
                    color: #212529;
                    font-size: 24px;
                    max-width: 200px;
                    margin-left: 10px;
                }
    `);

    /** Zmienna określająca, który przycisk został wciśnięty (1 = {@link locationButtonSearch}, 2 = {@link locationButtonCancel}). */
    const buttonPressed: number = await waitForButtonClick(locationText, locationButtonSearch, locationButtonCancel);
    if (buttonPressed == 1) {
        weather.location = locationText.text();
        const errorCode: number = await weather.updateWeather(new Date(), weather.isWeekly);
        if (errorCode == 1006)
            return errorCode;
        else return 0;
    } else return 1;
}
export function displaySubmenu(menuId: number, isWeekly?: boolean, _drawMainMenuInfo?: boolean): void {
    bodyWidget = new QWidget();
    bodyWidget.setObjectName('bodyWidget');
    bodyWidget.setLayout(new FlexLayout());
    if (!isWeekly) isWeekly = false;

    switch(menuId) {
        case 0: displaySubmenuMain().then((body: QWidget) => win.setCentralWidget(body)); break;
        case 1: displaySubmenuWeather(isWeekly).then((body: QWidget) => win.setCentralWidget(body)); break;
    }

    win.show();
    (global as any).win = win;
}
export function hideSubmenu(_menuId: number): void {}

async function fetchImagePixmap(url: string): Promise<QPixmap | null> {
    try {
        const response: AxiosResponse = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer: Buffer = Buffer.from(response.data);

        const imagePixmap: QPixmap = new QPixmap();
        imagePixmap.loadFromData(imageBuffer);

        return imagePixmap;
    } catch (e) {
        console.error(e);
        return null;
    }
}
async function displaySubmenuMain(): Promise<QWidget> {
    bodyWidget = new QWidget();
    bodyWidget.setObjectName('bodyWidget');
    bodyWidget.setLayout(new FlexLayout());

    /** Blok zawierający animowane logo aplikacji. */
    const logoWidget: QWidget = new QWidget();
    logoWidget.setObjectName('logoWidget');
    logoWidget.setLayout(new FlexLayout());
    bodyWidget.layout()?.addWidget(logoWidget);

        /** Obiekt reprezentujący animowane logo menu głównego. */
        const logoWidgetMovie: QMovie = new QMovie();
        logoWidgetMovie.setObjectName('logoWidgetMovie');
        logoWidgetMovie.setFileName(__dirname + '/media/logo.gif');
        logoWidgetMovie.setScaledSize(new QSize(200, 200));
        logoWidgetMovie.setSpeed(125);
        logoWidgetMovie.start();

            /** Etykieta, dzięki której wyświetlenie logo jest możliwe. */
            const logoWidgetLabel: QLabel = new QLabel();
            logoWidgetLabel.setObjectName('logoWidgetLabel');
            logoWidgetLabel.setAlignment(AlignmentFlag.AlignHCenter | AlignmentFlag.AlignVCenter);
            logoWidgetLabel.setMovie(logoWidgetMovie);
            logoWidget.layout()?.addWidget(logoWidgetLabel);

    const mainWidget: QWidget = new QWidget();
    mainWidget.setObjectName('mainWidget');
    mainWidget.setLayout(new FlexLayout());
    bodyWidget.layout()?.addWidget(mainWidget);

        /** Blok zawierający etykiety z nazwą aplikacji oraz informacjami o autorze. */
        const mainWidgetInfo: QWidget = new QWidget();
        mainWidgetInfo.setObjectName('mainWidgetInfo');
        mainWidgetInfo.setLayout(new FlexLayout());
        mainWidget.layout()?.addWidget(mainWidgetInfo);

            mainWidgetInfoName = new QLabel();
            mainWidgetInfoName.setObjectName('mainWidgetInfoName');
            mainWidgetInfoName.setText('          Pogodynka™ (%s)'.replace('%s', (process.env.IMPERIAL == "true") ? '°F' : '°C'));
            mainWidgetInfoName.setAlignment(AlignmentFlag.AlignLeft | AlignmentFlag.AlignVCenter);
            mainWidgetInfo.layout()?.addWidget(mainWidgetInfoName);

            /** Napis w menu głównym zawierający informacje o autorze aplikacji. */
            const mainWidgetInfoAuthor: QLabel = new QLabel();
            mainWidgetInfoAuthor.setObjectName('mainWidgetInfoAuthor');
            mainWidgetInfoAuthor.setText('© Gabriel Wasiluk          ');
            mainWidgetInfoAuthor.setAlignment(AlignmentFlag.AlignRight | AlignmentFlag.AlignVCenter);
            mainWidgetInfo.layout()?.addWidget(mainWidgetInfoAuthor);

        /** Blok zawierający menu nawigacyjne aplikacji. */
        const mainWidgetMenu: QWidget = new QWidget();
        mainWidgetMenu.setObjectName('mainWidgetMenu');
        mainWidgetMenu.setLayout(new FlexLayout());
        attachMainMenu(mainWidgetMenu);
        mainWidget.layout()?.addWidget(mainWidgetMenu);

    bodyWidget.setStyleSheet(`
        #bodyWidget {
            flex: 1;
            flex-direction: row;
        }
        
        #logoWidget {
            flex: 1;
            background-color: #fcfcff;
            max-width: 250px;
        }
            #logoWidgetLabel {
                margin-top: 18px;
            }
        
        #mainWidget {
            flex: 3;
            flex-direction: column;
        }
            #mainWidgetInfo {
                flex: 1;
                flex-direction: row;
                background-color: #ffcc53;
            }
                #mainWidgetInfoName, #mainWidgetInfoAuthor {
                    flex: 1;
                    color: #212529;
                    font-size: 24px;
                }
              
            #mainWidgetMenu {
                flex: 2;
                flex-direction: row;
                background-color: #7dcdff;
                padding-bottom: 55px;
            }
                #weatherButton, #settingsButton, #exitButton {
                    flex: 1;
                    color: white;
                    font-size: 24px;
                }
                #weatherButton {
                    margin-left: 34px;
                }
                #settingsButton {
                    margin: 0 17px;
                }
                #exitButton {
                    margin-right: 34px;
                }
    `);
    return bodyWidget;
}
async function displaySubmenuWeather(isWeekly: boolean): Promise<QWidget> {
    bodyWidget = new QWidget();
    bodyWidget.setObjectName('bodyWidget');
    bodyWidget.setLayout(new FlexLayout());

    const weather: Weather = new Weather(isWeekly);
    const imperial: boolean = (process.env.IMPERIAL == "true");
    switch(await displayLocationInput(weather)) {
        case 1: return displaySubmenuMain(); // przycisk "Anuluj" -> powrót do menu głównego
        case 1006: return displaySubmenuWeather(isWeekly); // podana lokalizacja nie została znaleziona -> pytamy jeszcze raz
    }

    const weatherDays: number = weather.weeklyDays;
    const isProPlus: boolean = (isWeekly) ? (weatherDays > 3) : true;
    lastLocationName = weather.location.original;
    console.log(lastLocationName);

    /** Wiersz zawierający kolumny z prognozami. */
    const forecastWidgets: QWidget = new QWidget();
    forecastWidgets.setObjectName('forecastWidgets');
    forecastWidgets.setLayout(new FlexLayout());
    bodyWidget.layout()?.addWidget(forecastWidgets);

    // pętla tworząca i wypełniająca pojedyńcze kolumny z prognozami
    for (let i: number = 0; i < ((isWeekly) ? weatherDays : 7); i++) {

        /** Pojedyńcza kolumna zawierająca prognozę. */
        const forecastSingle: QWidget = new QWidget();
        forecastSingle.setObjectName('forecastSingle');
        forecastSingle.setLayout(new FlexLayout());
        forecastWidgets.layout()?.addWidget(forecastSingle);

        /** Ikona pogody danej prognozy. */
        const forecastIcon: QLabel = new QLabel();
        forecastIcon.setObjectName('forecastIcon');
        forecastIcon.setMinimumSize(128, 128);
        forecastIcon.setAlignment(AlignmentFlag.AlignHCenter | AlignmentFlag.AlignVCenter);
        fetchImagePixmap(weather.iconUrls[i]).then((pixmap: QPixmap | null): void => { if (pixmap) forecastIcon.setPixmap(pixmap) });
        forecastSingle.layout()?.addWidget(forecastIcon);

        /** Obiekt zawierający dane dotyczące godziny/daty, temperatury, szans na opady, wilgotności oraz prędkości wiatrów danej prognozy. */
        const forecastData: { name: string[], text: string[], data: Array<string | number> } = {
            name: ['Time', 'Temperature', 'ChanceOf', 'Humidity', 'Wind'],
            text: [
                '%s' + ((isWeekly) ? '' : ':00'),
                '%s' + ((imperial) ? '°F' : '°C'),
                '\nOpady: %s%',
                'Wilgotność: %s%',
                'Wiatr: %s ' + ((imperial) ? 'mph' : 'km/h')
            ],
            data: [
                weather.timesOfForecasts[i],
                (imperial) ? weather.temperatures.f[i] : weather.temperatures.c[i],
                weather.chancesOf.rain[i],
                weather.humidities[i],
                (imperial) ? weather.winds[i].mph : weather.winds[i].kph,
            ],
        };

        const forecastLabels: QLabel[] = Array.from({ length: forecastData.data.length }, () => new QLabel());
        for (let j: number = 0; j < forecastData.data.length; j++) {
            const label: QLabel = forecastLabels[j];
            const name: string = forecastData.name[j];
            const text: string = forecastData.text[j];
            const data: string = forecastData.data[j].toString();

            label.setObjectName('forecast' + name);
            label.setText(text.replace('%s', data));
            label.setAlignment(AlignmentFlag.AlignHCenter | AlignmentFlag.AlignVCenter);
            forecastSingle.layout()?.addWidget(label);
        }
    }

    // w zależności czy mamy do czynienia z kluczem zwykłym, czy też kluczem Pro+
    if (!isProPlus) {
        /** Kolumna zastępująca cztery kolumny prognoz, wyświetlająca ostrzeżenie dotyczące klucza API. */
        const forecastWarning: QWidget = new QWidget();
        forecastWarning.setObjectName('forecastWarning');
        forecastWarning.setLayout(new FlexLayout());
        forecastWidgets.layout()?.addWidget(forecastWarning);

            /** Etykieta zawierająca tekst ostrzegający o podstawowej wersji klucza API. */
            const forecastWarningDescription: QLabel = new QLabel();
            forecastWarningDescription.setObjectName('forecastWarningDescription');
            forecastWarningDescription.setText('Twój klucz API może generować tylko 3-dniowe\nprognozy, których nie da się aktualizować.');
            forecastWarningDescription.setAlignment(AlignmentFlag.AlignHCenter | AlignmentFlag.AlignBottom);
            forecastWarning.layout()?.addWidget(forecastWarningDescription);

            /** Etykieta zawierająca tekst jak rozwiązać przedstawiony problem. */
            const forecastWarningSolution: QLabel = new QLabel();
            forecastWarningSolution.setObjectName('forecastWarningSolution');
            forecastWarningSolution.setText('Wykup plan Pro+, aby mieć dostęp do 7-dniowej\nprognozy pogody oraz jej automatyczną aktualizację.');
            forecastWarningSolution.setAlignment(AlignmentFlag.AlignHCenter | AlignmentFlag.AlignTop);
            forecastWarning.layout()?.addWidget(forecastWarningSolution);
    }

    /** Stopka z napisami oraz przyciskiem. */
    const footerWidget: QWidget = new QWidget();
    footerWidget.setObjectName('footerWidget');
    footerWidget.setLayout(new FlexLayout());
    bodyWidget.layout()?.addWidget(footerWidget);

        /** Informacja tekstowa w stopce. */
        const footerInfo: QLabel = new QLabel();
        footerInfo.setObjectName('footerInfo');
        footerInfo.setText(
            'Prognoza ' + ((isWeekly) ? 'tygodniowa' : 'godzinowa') + ' dla ' + weather.location.normalized + ', ' + weather.location.country
            + '\nNastępna automatyczna aktualizacja prognozy: ' + ((isProPlus) ? '(niedostępna)' : '(niedostępna)') // TODO
        );
        footerWidget.layout()?.addWidget(footerInfo);

        /** Przycisk powrotu do menu w stopce. */
        const footerButton: QPushButton = new QPushButton();
        footerButton.setObjectName('footerButton');
        footerButton.setText('Do menu');
        footerButton.setMaximumWidth(128);
        footerButton.addEventListener('clicked', () => displaySubmenu(0));
        footerWidget.layout()?.addWidget(footerButton);

    bodyWidget.setStyleSheet(`
        #bodyWidget {
            flex: 1;
            flex-direction: column;
        }
        
        #forecastWidgets {
            flex: 2;
            flex-direction: row;
            padding: 20px 0;
            background-color: lightgray;
        }
            #forecastSingle {
                flex: 1;
                flex-direction: column;
                margin-left: 10px;
                margin-right: 10px;
            }
                #forecastTime {
                    font-weight: bold;
                }
                #forecastTime, #forecastTemperature {
                    color: #212529;
                    font-size: 20px;
                }
                #forecastChanceOf, #forecastHumidity, #forecastWind {
                    color: #212529;
                    font-size: 16px;
                }
            #forecastWarning {
                flex: 4;
                flex-direction: column;
            }
                #forecastWarningDescription, #forecastWarningSolution {
                    flex: 1;
                    color: #dc3545;
                    font-size: 18px;
                    margin: 5px 0;
                }
                #forecastWarningSolution {
                    color: #007bff;
                }
                
        #footerWidget {
            flex: 1;
            flex-direction: row;
            padding: 15px 0;
            background-color: white;
        }
            #footerInfo {
                flex: 11;
                color: #212529;
                font-size: 20px;
                margin-left: 5px;
            }
            #footerButton {
                flex: 1;
                color: #212529;
                font-size: 20px;
                margin-right: 5px;
            }
    `);
    return bodyWidget;
}
function attachMainMenu(menuWidget: QWidget): void {
    const menuBar: QMenuBar | null = win.menuBar();
    const fileMenu: QMenu = new QMenu();
    /** Font wykorzystywany przez elementy list spod przycisków "Pogoda" oraz "Ustawienia". */
    const actionFont: QFont = new QFont('Arial', 12);

    /** Przycisk "Pogoda" znajdujący się w menu głównym, pokazujący listę opcji do wybrania po kliknięciu. */
    const weatherButton: QPushButton = new QPushButton();
    weatherButton.setObjectName('weatherButton');
    weatherButton.setText('Pogoda');
    weatherButton.addEventListener('clicked', (): void => weatherMenu.exec(weatherButton.mapToGlobal(new QPoint(0, weatherButton.height()))));
    menuWidget.layout()?.addWidget(weatherButton);
        const weatherMenu: QMenu = new QMenu();

        /** Pozycja na liście przycisku "Pogoda" prowadząca do prognozy dzisiejszej. */
        const weatherDaily: QAction = new QAction();
        weatherDaily.setObjectName('weatherDaily');
        weatherDaily.setText('prognoza dzisiejsza');
        weatherDaily.setFont(actionFont);
        weatherDaily.addEventListener('triggered', () => displaySubmenu(1, false));
        weatherMenu.addAction(weatherDaily);

        /** Pozycja na liście przycisku "Pogoda" prowadząca do prognozy tygodniowej. */
        const weatherWeekly: QAction = new QAction();
        weatherWeekly.setObjectName('weatherWeekly');
        weatherWeekly.setText('prognoza tygodniowa');
        weatherWeekly.setFont(actionFont);
        weatherWeekly.addEventListener('triggered', () => displaySubmenu(1, true));
        weatherMenu.addAction(weatherWeekly);

    /** Przycisk "Ustawienia" znajdujący się w menu głównym, pokazujący listę opcji do wybrania po kliknięciu. */
    const settingsButton: QPushButton = new QPushButton();
    settingsButton.setObjectName('settingsButton');
    settingsButton.setText('Ustawienia');
    settingsButton.addEventListener('clicked', (): void => settingsMenu.exec(settingsButton.mapToGlobal(new QPoint(0, settingsButton.height()))));
    menuWidget.layout()?.addWidget(settingsButton);
        const settingsMenu: QMenu = new QMenu();

        /** Pozycja na liście przycisku "Ustawienia" zmieniająca jednostki na metryczne. */
        const settingsMetric: QAction = new QAction();
        settingsMetric.setText('jednostki metryczne (°C + km/h)');
        settingsMetric.setFont(actionFont);
        settingsMetric.addEventListener('triggered', (): void => {
            process.env.IMPERIAL = 'false';
            mainWidgetInfoName.setText('          Pogodynka™ (°C)');
        });
        settingsMenu.addAction(settingsMetric);

        /** Pozycja na liście przycisku "Ustawienia" zmieniająca jednostki na imperialne. */
        const settingsImperial: QAction = new QAction();
        settingsImperial.setText('jednostki imperialne (°F + mph)');
        settingsImperial.setFont(actionFont);
        settingsImperial.addEventListener('triggered', (): void => {
            process.env.IMPERIAL = 'true';
            mainWidgetInfoName.setText('          Pogodynka™ (°F)');
        });
        settingsMenu.addAction(settingsImperial);

    /** Przycisk "Koniec" znajdujący się w menu głównym. */
    const exitButton: QPushButton = new QPushButton();
    exitButton.setObjectName('exitButton');
    exitButton.setText('Koniec');
    exitButton.addEventListener('clicked', () => process.exit(0));
    menuWidget.layout()?.addWidget(exitButton);

    fileMenu.addAction(weatherMenu.menuAction());
    menuBar?.addMenu(fileMenu);
}
function waitForButtonClick(l: QLineEdit, b1: QPushButton, b2: QPushButton): Promise<number> {
    return new Promise((resolve): void => {
        const handler1 = (): void => {
            if (l.text() != '') {
                cleanup();
                resolve(1);
            }
        };

        const handler2 = (): void => {
            cleanup(); resolve(2);
        };

        const cleanup = (): void => {
            b1.removeEventListener('clicked', handler1);
            b2.removeEventListener('clicked', handler2);
        };

        b1.addEventListener('clicked', handler1);
        b2.addEventListener('clicked', handler2);
    });
}