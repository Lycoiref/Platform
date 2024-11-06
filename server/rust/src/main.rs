use axum::{routing::get, Router};
use tokio::net::TcpListener;

async fn root() -> &'static str {
    "HelloWorld & Hello Cargo"
}

const PORT: i32 = 3000;

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(root));
    let listener = TcpListener::bind(format!("0.0.0.0:{}", PORT))
        .await
        .unwrap();

    println!(
        "Listening on http://127.0.0.1:{}",
        listener.local_addr().unwrap().port()
    );

    axum::serve(listener, app).await.unwrap();
}
