                     ┌────────────┐
                     │  Usuario   │
                     └────┬───────┘
                          │
                          ▼
                 Entra al Login Page
                          │
                          ▼
             Ingresa credenciales válidas
                          │
                          ▼
               ┌───────────────────────┐
               │   AuthContext.login() │
               └───────────────────────┘
                          │
                          ▼
         Guarda token y datos en localStorage
                          │
                          ▼
        Actualiza estado global de `user` y `token`
                          │
                          ▼
               Redirige a página Home
                          │
                          ▼
        ┌────────────────────────────────────┐
        │  App o componentes usan useAuth()  │
        │ para acceder a user, logout, etc.  │
        └────────────────────────────────────┘
                          │
                          ▼
          Muestra contenido según el rol
                (admin o estudiante)
                          │
                          ▼
             ┌─────────────────────┐
             │  AuthContext.logout │
             └─────────────────────┘
                          │
                          ▼
        Limpia token y datos de localStorage
                          │
                          ▼
            Redirige a Login automáticamente