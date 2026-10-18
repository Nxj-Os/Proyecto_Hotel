package com.hotel.demo.repository;

import com.hotel.demo.model.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {

    List<Habitacion> findByDisponible(Boolean disponible);
}
