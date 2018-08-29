const accessPoints = [
    {
        ssid: 'Verizon WiFi',
        centre: new Point(2, 3),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'McDonald\'s Wifi',
        centre: new Point(25, 18),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'Joe\'s iPhone',
        centre: new Point(9, -8),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'NETGEAR68',
        centre: new Point(-4, 5),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'Who wants free WiFi',
        centre: new Point(45, 3),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'Free WiFi Initiative',
        centre: new Point(18, -24),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'Prada WiFi',
        centre: new Point(-16, 0),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'AndroidAP',
        centre: new Point(29, -15),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'Linksys',
        centre: new Point(-5, 7),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'PuzzleConf',
        centre: new Point(8, 24),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: '[binary stuff]',
        centre: new Point(14, -10),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'Hyatt',
        centre: new Point(18, 24),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'xfinitywifi',
        centre: new Point(-19, 28),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }, {
        ssid: 'Muller home',
        centre: new Point(-7, -7),
        radius: 24,
        speed: { download: 10, upload: 20 }
    }
].map(options => new AccessPoint(options));
