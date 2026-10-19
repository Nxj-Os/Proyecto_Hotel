package com.hotel.demo.config;

import com.hotel.demo.model.Habitacion;
import com.hotel.demo.model.Usuario;
import com.hotel.demo.repository.HabitacionRepository;
import com.hotel.demo.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(HabitacionRepository habitacionRepository,
                               UsuarioRepository usuarioRepository) {
        return args -> {
            if (habitacionRepository.count() == 0) {
                habitacionRepository.save(new Habitacion(null, "101", "suite-presidencial", 400.0, true));
                habitacionRepository.save(new Habitacion(null, "102", "habitacion-deluxe", 250.0, true));
                habitacionRepository.save(new Habitacion(null, "103", "suite-junior", 180.0, true));
                habitacionRepository.save(new Habitacion(null, "104", "habitacion-estandar", 120.0, true));
            }

            if (usuarioRepository.findByEmail("demo@hotel.com").isEmpty()) {
                usuarioRepository.save(new Usuario(null, "Usuario Demo", "demo@hotel.com", "demo123", "CLIENTE"));
            }
        };
    }
}
