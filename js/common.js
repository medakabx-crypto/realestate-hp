// ヘッダーを読み込む
fetch("common/header.html")
    .then(response => {

        // 読み込みに失敗した場合
        if (!response.ok) {
            throw new Error("header.htmlの読み込みに失敗しました");
        }

        return response.text();

    })
    .then(data => {

        // ヘッダーを表示
        document.getElementById("header").innerHTML = data;


        // スマホメニューを設定
        const menuButton = document.getElementById("menu-button");
        const spNav = document.getElementById("sp-nav");


        // メニューボタンをクリック
        menuButton.addEventListener("click", () => {

            // メニューの表示・非表示を切り替え
            spNav.classList.toggle("open");

        });

    })
    .catch(error => {

        console.error(error);

    });


// フッターを読み込む
fetch("common/footer.html")
    .then(response => {

        // 読み込みに失敗した場合
        if (!response.ok) {
            throw new Error("footer.htmlの読み込みに失敗しました");
        }

        return response.text();

    })
    .then(data => {

        // フッターを表示
        document.getElementById("footer").innerHTML = data;

    })
    .catch(error => {

        console.error(error);

    });