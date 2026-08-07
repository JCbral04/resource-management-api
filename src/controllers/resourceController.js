// Datos en memoria (simulando base de datos)
let resources = [
    { id: 1, name: 'Laptop Dell XPS', type: 'electronic', quantity: 10, available: true, createdAt: '2026-01-15' },
    { id: 2, name: 'Silla Ergonomica', type: 'furniture', quantity: 5, available: true, createdAt: '2026-02-20' }
  ];
  let nextId = 3;
  
  const resourceController = {
    // GET /api/v1/resources
    getAllResources: (req, res) => {
      res.status(200).json({
        data: resources,
        count: resources.length,
        timestamp: new Date().toISOString()
      });
    },
  
    // GET /api/v1/resources/:id
    getResourceById: (req, res) => {
      const id = parseInt(req.params.id);
      const resource = resources.find(r => r.id === id);
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      res.status(200).json({ data: resource });
    },
  
    // POST /api/v1/resources
    createResource: (req, res) => {
      const { name, type, quantity, available } = req.body;
      
      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
      }
      
      const newResource = {
        id: nextId++,
        name,
        type,
        quantity: quantity || 0,
        available: available !== undefined ? available : true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      resources.push(newResource);
      res.status(201).json({ data: newResource, message: 'Resource created successfully' });
    },
  
    // PUT /api/v1/resources/:id
    updateResource: (req, res) => {
      const id = parseInt(req.params.id);
      const index = resources.findIndex(r => r.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      const { name, type, quantity, available } = req.body;
      
      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
      }
      
      resources[index] = {
        ...resources[index],
        name,
        type,
        quantity: quantity !== undefined ? quantity : resources[index].quantity,
        available: available !== undefined ? available : resources[index].available
      };
      
      res.status(200).json({ data: resources[index], message: 'Resource updated successfully' });
    },
  
    // PATCH /api/v1/resources/:id
    partialUpdateResource: (req, res) => {
      const id = parseInt(req.params.id);
      const index = resources.findIndex(r => r.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      resources[index] = { ...resources[index], ...req.body };
      res.status(200).json({ data: resources[index], message: 'Resource partially updated' });
    },
  
    // DELETE /api/v1/resources/:id
    deleteResource: (req, res) => {
      const id = parseInt(req.params.id);
      const index = resources.findIndex(r => r.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      const deleted = resources.splice(index, 1);
      res.status(200).json({ data: deleted[0], message: 'Resource deleted successfully' });
    }
  };
  
  module.exports = resourceController;