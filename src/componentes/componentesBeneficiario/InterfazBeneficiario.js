import React, { useState } from "react"
import { Box, Typography, List, ListItem, ListItemText, IconButton, Checkbox, Modal, CardMedia } from "@mui/material"
import { YouTube as YouTubeIcon, Image as ImageIcon, Close as CloseIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material"

const initialTasks = [
  { 
    id: 1, 
    name: "Tarea de Matemáticas", 
    description: "Resolver problemas del capítulo 5", 
    dueDate: "2023-06-15", 
    completedBy: [1, 3],
    materials: [
      { type: "video", url: "https://www.youtube.com/watch?v=ymG01zCW1Iw", title: "Explicación de álgebra" },
      { type: "image", url: "https://example.com/math-formulas.jpg", title: "Fórmulas importantes" }
    ]
  },
  { 
    id: 2, 
    name: "Proyecto de Ciencias", 
    description: "Investigación sobre energías renovables", 
    dueDate: "2023-06-20", 
    completedBy: [2],
    materials: [
      { type: "image", url: "https://example.com/renewable-energy.jpg", title: "Infografía de energías renovables" }
    ]
  }
]

const currentUser = { id: 1, name: "Ana García", role: "student" }

function StudentDashboard() {
  const [tasks, setTasks] = useState(initialTasks)
  const [openMaterial, setOpenMaterial] = useState(null)

  const handleOpenMaterial = (material) => {
    setOpenMaterial(material)
  }

  const handleCloseMaterial = () => {
    setOpenMaterial(null)
  }

  const handleToggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedCompletedBy = task.completedBy.includes(currentUser.id)
          ? task.completedBy.filter(id => id !== currentUser.id)
          : [...task.completedBy, currentUser.id]
        return { ...task, completedBy: updatedCompletedBy }
      }
      return task
    }))
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Tareas Asignadas
      </Typography>
      <List>
        {tasks.map((task) => (
          <ListItem key={task.id} divider>
            <ListItemText
              primary={task.name}
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    {task.description}
                  </Typography>
                  <br />
                  Fecha de entrega: {task.dueDate}
                </React.Fragment>
              }
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {task.materials.map((material, index) => (
                <IconButton key={index} onClick={() => handleOpenMaterial(material)}>
                  {material.type === "video" ? <YouTubeIcon /> : <ImageIcon />}
                </IconButton>
              ))}
              <Checkbox
                edge="end"
                onChange={() => handleToggleTaskCompletion(task.id)}
                checked={task.completedBy.includes(currentUser.id)}
                checkedIcon={<CheckCircleIcon />}
                inputProps={{ 'aria-labelledby': `checkbox-list-label-${task.id}` }}
              />
            </Box>
          </ListItem>
        ))}
      </List>

      <Modal open={!!openMaterial} onClose={handleCloseMaterial}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          <IconButton
            aria-label="close"
            onClick={handleCloseMaterial}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {openMaterial?.type === "video" ? (
            <iframe
              width="100%"
              height="400"
              src={openMaterial.url}
              title={openMaterial.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <CardMedia
              component="img"
              image={openMaterial?.url}
              alt={openMaterial?.title}
              sx={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
          <Typography variant="h6" component="h2" mt={2}>
            {openMaterial?.title}
          </Typography>
        </Box>
      </Modal>
    </Box>
  )
}

export default StudentDashboard
