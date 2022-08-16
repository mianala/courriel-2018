let express = require('express');
let projectModel = require('../models/project');
let beModel = require('../models/be');
let router = express.Router();
let xls = require('xlsx')
const env = require('../env/env')
const pathModule = require("path");

let multer = require('multer');
const fileModel = require('../models/file');

let storage = multer.diskStorage({
  //todo:this is a property of the entity USER.FILESTORAGE
  destination: (req, file, cb) => {
    cb(null, 'public/project/')
  },
  filename: (req, file, cb) => {
    cb(null, 'project-' + Date.now() + '-' + file.originalname)
  }
});


let upload = multer({
  storage: storage
});

router.get('/all/:entity_id', (req, res, next) => {
  let entity_id = req.params['entity_id'];
  projectModel.getAllProjects(entity_id, (projects) => {
    res.json(projects)
  })
});

// print
router.post('/print', (req, res, next) => {
  let projects = JSON.parse(req.body.project);

  // projectModel.getAllProjects(entity_id, (projects) => {
  var wb = xls.utils.book_new();
  var ws = xls.utils.json_to_sheet(projects, {
    header: ['A', 'B', 'C', 'D'],
    skipHeader: true
  })

  xls.utils.book_append_sheet(wb, ws, 'lecture')

  var file = new Date().getTime() + '.xlsx'
  var path = pathModule.join(__dirname, '../public/exports/') + file
  xls.writeFile(wb, path)
  // console.log(pathModule.join(__dirname, '../public/exports/') + file)
  res.send(file)
  // })
});


// latest projects
router.get('/latest/:entity_id', (req, res, next) => {
  let entity_id = req.params['entity_id'];
  projectModel.getLatestProjects(entity_id, (projects) => {
    res.json(projects)
  })
});

// treat project
router.post('/treat', (req, res, next) => {
  projectModel.treat(req.body, () => {
    res.send('Project treated')
  })
});

//get project
router.get('/:project_id', (req, res, next) => {
  const project_id = req.params["project_id"];
  console.log('project id  : ' + project_id);
  projectModel.getProject(project_id, (project) => {
    res.json(project)
  })
});


router.delete('/:id', (req, res, next) => {
  console.log(req.params['id'])
  projectModel.deleteProject(req.params['id'], () => {
    res.send('project deleted')
  })
})

//save project
router.post('/', upload.array("files", 10), (req, res, next) => {

  projectModel.saveProject(req.body, id => {
    fileModel.saveProjectFiles(id, req.files);
    console.log(id)
    res.json({
      id: id,
      status: 200
    })
  })
});


//udpate project
router.put('/', upload.array("files", 10), (req, res, next) => {
  const project = JSON.parse(req.body.project)
  fileModel.saveProjectFilesN(project.id, req.files, () => {
    projectModel.editProject(project, (id) => {
      res.json({
        id: id
      })
    })
  })
});

//update status project
router.put('/update_project_status', (req, res, next) => {
  console.log(req.body)
  const q = req.body
  projectModel.updateStatus(q.project_id, q.entity_id, q.status_id, (result) => {
    res.json(result)
  })
});


//compose project
router.post('/compose', upload.array("files", 10), (req, res, next) => {

  const project = JSON.parse(req.body.project);


  projectModel.composeProject(project, result => {

    fileModel.saveThreadFiles(result.thread_id, req.files, () => {
      if (req.body['be']) {
        const be = JSON.parse(req.body['be']);
        be.flow_id = result.id;

        beModel.save(beModel.parse(be), () => {
          res.send('Composed project ' + result.id)
        })
      } else {
        // console.log(req.body);
        res.send('Composed project ' + result.id)
      }
    })
  })
});

//delete project email
router.delete('/:id', (req, res, next) => {
  const project_id = req.params["id"];
  console.log('deleting project ' + project_id);
  projectModel.deleteProject(project_id, entity_id, (result) => {
    //todo websocket deleted
    res.send('deleted')
  })
});


// untreat flow
router.post('/untreat', (req, res, next) => {
  projectModel.untreat(req.body['id'], () => {
    res.send('Project untreated')
  })
});


module.exports = router;