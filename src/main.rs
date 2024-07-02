use actix_cors::Cors;
use actix_web::{post, web, App, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::fs::File;
use csv::Writer;

#[derive(Deserialize, Serialize)]
struct Record {
    Frage: String,
    Antwort: String,
    Kategorie: String,
    Erstellungsdatum: String,
}

#[post("/backup")]
async fn backup(data: web::Json<Vec<Record>>) -> impl Responder {
    print!("Backup funktion aufgerufen");
    let file_path = "backup.csv";
    let file = File::create(file_path).expect("Konnte Datei nicht erstellen");
    let mut wtr = Writer::from_writer(file);

    for record in data.iter() {
        wtr.serialize(record).expect("Konnte Record nicht schreiben");
    }

    wtr.flush().expect("Konnte CSV nicht schreiben");

    format!("Backup erfolgreich in {}", "./backup.csv")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Server läuft");
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .service(backup)
    })
        .bind("127.0.0.1:8000")?
        .run()
        .await
}
