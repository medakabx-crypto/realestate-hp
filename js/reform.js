/* スプレッドシート設定 */
const SPREADSHEET_ID =
    "1tJYNLRsLskd3AprDuwcV_bBuL-ep_nKWMGMISDhIn8c";

const SHEET_NAME = "リフォーム";


/* 表示するカテゴリーの順番 */
const CATEGORY_ORDER = [
    "内装リフォーム",
    "和室・建具リフォーム",
    "水回りリフォーム",
    "外装・その他の工事"
];


/* リフォーム情報を取得 */
async function loadReformData() {

    const reformList = document.getElementById("reform-list");

    try {

        const url =
            "https://docs.google.com/spreadsheets/d/" +
            SPREADSHEET_ID +
            "/gviz/tq?sheet=" +
            encodeURIComponent(SHEET_NAME) +
            "&tqx=out:json";

        const response = await fetch(url, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("スプレッドシートを取得できませんでした。");
        }

        const text = await response.text();

        /* Google VisualizationのJSON部分を取得 */
        const start = text.indexOf("(");
        const end = text.lastIndexOf(")");

        if (start === -1 || end === -1) {
            throw new Error("スプレッドシートのデータ形式が正しくありません。");
        }

        const json = JSON.parse(
            text.substring(start + 1, end)
        );

        const rows = json.table.rows || [];


        /* データを配列に変換 */
        const reformData = rows
            .map(function (row) {

                const cells = row.c || [];

                return {
                    order: getCellValue(cells, 0),
                    publish: getCellValue(cells, 1),
                    category: getCellValue(cells, 2),
                    name: getCellValue(cells, 3),
                    price1: getCellValue(cells, 4),
                    price2: getCellValue(cells, 5),
                    description: getCellValue(cells, 6),
                    photo: getCellValue(cells, 7)
                };

            })
            .filter(function (item) {

                /* 公開が○または〇なら表示 */
                return isPublic(item.publish);

            })
            .sort(function (a, b) {

                return Number(a.order) - Number(b.order);

            });


        /* 一覧を作成 */
        renderReformList(reformList, reformData);

    } catch (error) {

        console.error(error);

        reformList.innerHTML = "";

        const errorMessage = document.createElement("p");

        errorMessage.className = "reform-error";

        errorMessage.textContent =
            "リフォーム情報を読み込めませんでした。";

        reformList.appendChild(errorMessage);

    }

}


/* セルの値を取得 */
function getCellValue(cells, index) {

    if (!cells[index]) {
        return "";
    }

    if (cells[index].f !== undefined && cells[index].f !== null) {
        return String(cells[index].f);
    }

    if (cells[index].v !== undefined && cells[index].v !== null) {
        return String(cells[index].v);
    }

    return "";
}


/* 公開判定 */
function isPublic(value) {

    const normalizedValue =
        String(value)
            .trim()
            .replace(/\s/g, "");

    return (
        normalizedValue === "○" ||
        normalizedValue === "〇"
    );

}


/* リフォーム一覧を作成 */
function renderReformList(container, data) {

    container.innerHTML = "";

    if (data.length === 0) {

        const message = document.createElement("p");

        message.className = "reform-loading";

        message.textContent =
            "公開中のリフォーム情報がありません。";

        container.appendChild(message);

        return;
    }


    /* カテゴリーごとに分類 */
    const categoryMap = new Map();

    data.forEach(function (item) {

        const category =
            item.category.trim();

        if (!categoryMap.has(category)) {
            categoryMap.set(category, []);
        }

        categoryMap.get(category).push(item);

    });


    /* 決めたカテゴリー順で表示 */
    const orderedCategories = [];

    CATEGORY_ORDER.forEach(function (category) {

        if (categoryMap.has(category)) {

            orderedCategories.push({
                name: category,
                items: categoryMap.get(category)
            });

            categoryMap.delete(category);

        }

    });


    /* 新しいカテゴリーにも対応 */
    categoryMap.forEach(function (items, category) {

        orderedCategories.push({
            name: category,
            items: items
        });

    });


    /* カテゴリーを作成 */
    orderedCategories.forEach(function (categoryData) {

        const section =
            document.createElement("section");

        section.className = "reform-category";


        /* カテゴリー名 */
        const title =
            document.createElement("h3");

        title.className = "reform-category-title";

        title.textContent = categoryData.name;


        /* カードグリッド */
        const grid =
            document.createElement("div");

        grid.className = "reform-grid";


        /* カードを作成 */
        categoryData.items.forEach(function (item) {

            const card =
                createReformCard(item);

            grid.appendChild(card);

        });


        section.appendChild(title);

        section.appendChild(grid);

        container.appendChild(section);

    });

}


/* リフォームカードを作成 */
function createReformCard(item) {

    const article =
        document.createElement("article");

    article.className = "reform-card";


    /* 写真 */
    const image =
        document.createElement("img");

    image.className = "reform-card-image";

    let photoName =
        item.photo.trim();

    /* 写真名が空なら表示順から自動設定 */
    if (!photoName) {
        photoName =
            "reform_" +
            item.order +
            ".jpg";
    }

    image.src =
        "images/" +
        encodeURIComponent(photoName)
            .replace(/%2F/g, "/");

    image.alt =
        item.name;

    image.loading =
        "lazy";


    /* カード本文 */
    const body =
        document.createElement("div");

    body.className =
        "reform-card-body";


    /* 工事名 */
    const title =
        document.createElement("h3");

    title.className =
        "reform-card-title";

    title.textContent =
        item.name;


    /* 説明 */
    const description =
        document.createElement("p");

    description.className =
        "reform-card-description";

    description.textContent =
        item.description.trim();


    /* 価格 */
    const priceList =
        document.createElement("div");

    priceList.className =
        "reform-price-list";


    if (item.price1.trim()) {

        const price1 =
            document.createElement("p");

        price1.className =
            "reform-price-item";

        price1.textContent =
            item.price1.trim();

        priceList.appendChild(price1);

    }


    if (item.price2.trim()) {

        const price2 =
            document.createElement("p");

        price2.className =
            "reform-price-item";

        price2.textContent =
            item.price2.trim();

        priceList.appendChild(price2);

    }


    /* 表示順を設定 */
    body.appendChild(title);

    if (item.description.trim()) {
        body.appendChild(description);
    }

    if (priceList.children.length > 0) {
        body.appendChild(priceList);
    }


    article.appendChild(image);

    article.appendChild(body);


    return article;

}


/* 読み込み開始 */
loadReformData();