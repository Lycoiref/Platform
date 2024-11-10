use std::collections::HashMap;

use axum::{extract::Query, http::Method, routing::get, Router};
use tokio::net::TcpListener;

async fn root() -> &'static str {
    "HelloWorld & Hello Cargo"
}

async fn hello_world(method: Method, Query(query): Query<HashMap<String, String>>) -> String {
    let error_message = String::from("None");
    let name = query.get("name").unwrap_or(&error_message);
    println!("{}", name);
    dbg!(method, &query);

    name.to_string()
}

const PORT: i32 = 3000;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(root))
        .route("/test", get(hello_world));
    let listener = TcpListener::bind(format!("0.0.0.0:{}", PORT))
        .await
        .unwrap();

    println!(
        "Listening on http://127.0.0.1:{}",
        listener.local_addr().unwrap().port()
    );

    axum::serve(listener, app).await.unwrap();
}
