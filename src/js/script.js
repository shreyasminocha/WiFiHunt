window.onload = () => {
    kontra.init();

    const loop = kontra.gameLoop({
        update: () => {},
        render: () => {}
    });

    loop.start();
};
