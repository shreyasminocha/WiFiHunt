const accessPoints = [
    {
        ssid: 'Verizon WiFi',
        centre: new Point(2, 3),
        radius: 40,
        speed: { download: 2, upload: 1 }
    }, {
        ssid: 'McDonald\'s Wifi',
        centre: new Point(25, 18),
        radius: 15,
        speed: { download: 7, upload: 14 }
    }, {
        ssid: 'Average Joe\'s iPhone',
        centre: new Point(9, -8),
        radius: 7.5,
        speed: { download: 3, upload: 5 }
    }, {
        ssid: 'NETGEAR68',
        centre: new Point(-4, 5),
        radius: 24,
        speed: { download: 8, upload: 5 }
    }, {
        ssid: 'Who wants free WiFi',
        centre: new Point(45, 3),
        radius: 24,
        speed: { download: 1, upload: 1 }
    }, {
        ssid: 'Free WiFi Initiative',
        centre: new Point(18, -24),
        radius: 100,
        speed: { download: 512 / 1024, upload: 1 }
    }, {
        ssid: 'Prada WiFi',
        centre: new Point(-16, 0),
        radius: 40,
        speed: { download: 10, upload: 20 },
        cost: 240
    }, {
        ssid: 'AndroidAP',
        centre: new Point(29, -15),
        radius: 15,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'Linksys',
        centre: new Point(-5, 7),
        radius: 30,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'PuzzleConf',
        centre: new Point(8, 24),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'Azure Diamond',
        centre: new Point(14, -10),
        radius: 35,
        speed: { download: 10, upload: 20 },
        password: 1265856690,
        encryption: 'WPA2'
    }, {
        ssid: 'Hyatt',
        centre: new Point(18, 24),
        radius: 20,
        speed: { download: 7.5, upload: 10 },
        cost: 300
    }, {
        ssid: 'xfinitywifi',
        centre: new Point(-19, 28),
        radius: 20,
        speed: { download: 5, upload: 15 }
    }, {
        ssid: 'xfinitywifi',
        centre: new Point(40, -5),
        radius: 40,
        speed: { download: 10, upload: 20 },
        cost: 160
    }, {
        ssid: 'Muller home',
        centre: new Point(-7, -7),
        radius: 33,
        speed: { download: 10, upload: 20 }
    },
    {
        ssid: '⏩',
        centre: new Point(57.1, 57.1),
        radius: 0.5,
        speed: { download: 100, upload: 100 }
    }
].map(options => new AccessPoint(options));
