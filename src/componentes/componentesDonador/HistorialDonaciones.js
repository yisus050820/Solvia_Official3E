import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HistorialDonaciones = () => {
  const [donaciones, setDonaciones] = useState([
    { id: 1, cantidad: 500, fecha: '2023-09-15' },
    { id: 2, cantidad: 1000, fecha: '2023-10-01' },
    { id: 3, cantidad: 250, fecha: '2023-10-05' }
  ]);

  return (
    <>
      <div className="w-full px-6 py-4 mx-auto mt-10">
        <motion.h1
          className="text-3xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Historial de Donaciones
        </motion.h1>

        <motion.table
          className="w-full bg-gray-800 text-white rounded-lg shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Cantidad (MXN)</th>
              <th className="p-4 text-left">Fecha</th>
            </tr>
          </thead>
          <motion.tbody layout>
            {donaciones.map((donacion) => (
              <motion.tr
                key={donacion.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="border-b border-gray-700"
              >
                <td className="p-4">{donacion.id}</td>
                <td className="p-4">
                  {Number(donacion.cantidad).toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  })}
                </td>
                <td className="p-4">{donacion.fecha}</td>
              </motion.tr>
            ))}
          </motion.tbody>
        </motion.table>
      </div>
    </>
  );
};

export default HistorialDonaciones;
