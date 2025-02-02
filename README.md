Just wanted to try out syncing my notes from phone to pc with this small app :)

graph TB
    subgraph Frontend
        UI["UI"]:::frontend
        CL["Client Logic"]:::frontend
        UI --- CL
    end

    subgraph Backend
        SV["Server"]:::backend
        API["API"]:::api
        SV --- API
    end

    DB["JSON Storage"]:::storage

    CL --> API
    API --> CL
    SV --> DB

    click UI "https://github.com/perseusnomit/SyncedNotepad/blob/main/public/index.html"
    click CL "https://github.com/perseusnomit/SyncedNotepad/blob/main/public/app.js"
    click SV "https://github.com/perseusnomit/SyncedNotepad/blob/main/server.js"
    click DB "https://github.com/perseusnomit/SyncedNotepad/blob/main/notes-db.json"

    classDef frontend fill:#3498db,stroke:#2980b9,color:white
    classDef backend fill:#2ecc71,stroke:#27ae60,color:white
    classDef api fill:#95a5a6,stroke:#7f8c8d,color:white
    classDef storage fill:#f1c40f,stroke:#f39c12,color:black
