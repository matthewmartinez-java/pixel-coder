use mysql::*;
use mysql::prelude::*;
use rand::Rng;

fn main() {
    let url = "mysql://student:student@localhost:3306/pixel_db";
    let pool = Pool::new(url).unwrap();
    let mut conn = pool.get_conn().unwrap();
    let max = 1000;

    let disable_fk_checks = "SET FOREIGN_KEY_CHECKS = 0";
    conn.query_drop(disable_fk_checks).unwrap();

    let truncate_payment_details = "TRUNCATE TABLE payment_details";
    let truncate_product_reviews = "TRUNCATE TABLE product_reviews";
    let truncate_order_items = "TRUNCATE TABLE order_items";
    let truncate_orders = "TRUNCATE TABLE orders";
    let truncate_cart_items = "TRUNCATE TABLE cart_items";
    let truncate_carts = "TRUNCATE TABLE carts";
    let truncate_products = "TRUNCATE TABLE products";
    let truncate_customers = "TRUNCATE TABLE customers";

    conn.query_drop(truncate_payment_details).unwrap();
    conn.query_drop(truncate_product_reviews).unwrap();
    conn.query_drop(truncate_order_items).unwrap();
    conn.query_drop(truncate_orders).unwrap();
    conn.query_drop(truncate_cart_items).unwrap();
    conn.query_drop(truncate_carts).unwrap();
    conn.query_drop(truncate_products).unwrap();
    conn.query_drop(truncate_customers).unwrap();

    let enable_fk_checks = "SET FOREIGN_KEY_CHECKS = 1";
    conn.query_drop(enable_fk_checks).unwrap();

    //users
    for _ in 0..max {
        let username = generate_random_string(8);
        let password = generate_random_string(12);
        let email = generate_random_email();

        let query = "INSERT INTO customers (username, password, email) VALUES (?, ?, ?)";
        conn.exec_drop(query, (username, password, email)).unwrap();
    }

    //products
    for _ in 0..max {
        let name = generate_item_name();
        let price = generate_random_price();
        let description = get_description();
        let image_number = rand::thread_rng().gen_range(1..=13);
        let image = format!("resources/item{}.jpg", image_number);
        let recommended = rand::thread_rng().gen_bool(0.2);
        let community_pick = rand::thread_rng().gen_bool(0.1);
        let trending = rand::thread_rng().gen_bool(0.3);

        let query = "INSERT INTO products (name, price, description, image_url, recommended, community_pick, trending)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
        conn.exec_drop(query, (name, price, description, image, recommended, community_pick, trending)).unwrap();
    }

    //reviews
    for _ in 0..max {
        let product_id = rand::thread_rng().gen_range(1..=max);
        let customer_id = rand::thread_rng().gen_range(1..=max);
        let rating = rand::thread_rng().gen_range(1..=5);
        let comment = get_description();
        let review_date = generate_random_datetime();

        let query = "INSERT INTO product_reviews (product_id, customer_id, rating, comment, review_date)
            VALUES (?, ?, ?, ?, ?)";
        conn.exec_drop(query, (product_id, customer_id, rating, comment, review_date)).unwrap();
    }

    println!("Data insertion completed successfully!");
}

fn generate_random_string(length: usize) -> String {
    let chars: &[u8] = b"abcdefghijklmnopqrstuvwxyz0123456789";
    let mut rng = rand::thread_rng();
    (0..length)
        .map(|_| chars[rng.gen_range(0..chars.len())] as char)
        .collect()
}

fn generate_random_email() -> String {
    let name = generate_random_string(8);
    let domain = generate_random_string(5);
    format!("{}@{}.com", name, domain)
}

fn generate_random_price() -> f64 {
    let price = rand::thread_rng().gen_range(0..=100) as f64 + rand::thread_rng().gen_range(0..=99) as f64 / 100.0;
    price
}

fn generate_item_name() -> String {
    let prefixes = vec![
        "Pixel", "8-Bit", "Retro", "Voxel", "Blocky", "Low-Res", "Chunky", "Pixelated",
    ];
    let items = vec![
        "Art", "Stickers", "Water Bottle", "Poster", "Canvas Print", "Enamel Pin",
        "Sunglasses", "Vinyl Decal", "T-Shirt", "Notebook", "Keychain", "Plush",
        "Phone Case", "Temporary Tattoo", "Patch", "Tapestry", "Magnet Set", "Beanie",
        "Tote Bag", "Cushion Cover", "Socks", "Hat", "Art Print", "Mousepad",
        "Stationery Set", "Lamp", "Coasters", "Messenger Bag", "Flower Crown", "Scarf",
        "Earrings", "Cufflinks", "Hoodie", "Flag", "Terrarium", "Pillow", "Shirt",
        "Tie", "Wind Chime", "Soap", "Eye Mask", "Neon Sign", "Keyring", "Jigsaw Puzzle",
    ];

    let prefix = prefixes[rand::thread_rng().gen_range(0..prefixes.len())];
    let item = items[rand::thread_rng().gen_range(0..items.len())];

    format!("{} {}", prefix, item)
}

fn get_description() -> String {
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vulputate eu scelerisque felis imperdiet proin fermentum. Sit amet tellus cras adipiscing enim eu turpis egestas pretium. Egestas sed sed risus pretium quam vulputate dignissim. Eu non diam phasellus vestibulum lorem sed risus. Feugiat vivamus at augue eget arcu dictum. Ipsum dolor sit amet consectetur adipiscing elit pellentesque. Id porta nibh venenatis cras sed felis eget velit aliquet. Nibh sed pulvinar proin gravida. Tellus pellentesque eu tincidunt tortor aliquam nulla. Amet mauris commodo quis imperdiet massa tincidunt nunc pulvinar. Morbi blandit cursus risus at ultrices mi. Eu facilisis sed odio morbi quis.".to_string()
}

fn generate_random_datetime() -> String {
    let year = rand::thread_rng().gen_range(2020..=2023);
    let month = rand::thread_rng().gen_range(1..=12);
    let day = rand::thread_rng().gen_range(1..=28);
    let hour = rand::thread_rng().gen_range(0..=23);
    let minute = rand::thread_rng().gen_range(0..=59);
    let second = rand::thread_rng().gen_range(0..=59);

    format!("{}-{:02}-{:02} {:02}:{:02}:{:02}", year, month, day, hour, minute, second)
}
