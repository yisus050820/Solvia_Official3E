import React, { useState } from 'react';
import { motion } from 'framer-motion';


const VerPersonas = () => {
  const [data, setData] = useState([
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Coordinador', description: 'Coordina actividades del proyecto' },
    { id: 2, name: 'Ana Gómez', email: 'ana@example.com', role: 'Voluntario', description: 'Ayuda en eventos' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'Donante', description: 'Donador frecuente' },
  ]);

  return (
    <>
      <div className="w-full px-6 py-0.1 mx-auto mt-10">
        <motion.table
          className="w-full bg-gray-800 text-white rounded-lg shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Nombre</th>
              <th className="p-4 text-left">Correo</th>
              <th className="p-4 text-left">Rol</th>
              <th className="p-4 text-left">Descripción</th>
            </tr>
          </thead>
          <motion.tbody layout>
            {data.map((item) => (
              <motion.tr
                key={item.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="border-b border-gray-700"
              >
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.email}</td>
                <td className="p-4">{item.role}</td>
                <td className="p-4">{item.description}</td>
              </motion.tr>
            ))}
          </motion.tbody>
        </motion.table>
      </div>
    </>
  );
};

export default VerPersonas;
