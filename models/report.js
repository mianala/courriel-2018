const db = require('./db');

class Report {
  static init(report) {
    // todo fill with attributes
    return {
      id: report.id
    }
  }

  static transpose(a) {
    let reports = []
    a.forEach(report => {
      reports.push(this.init(report))
    })
    return reports
  }

  save(report, next) {
    // todo fill with attributes
    const query = `
      BEGIN
        INSERT_REPORT(
          
        );
      END;
    `

    // todo fill with attributes
    let bindvars = {}
    console.log('saving report')

    db.execute(query, bindvars, (result => {
      const id = result.outBinds.id
      next(id)
    }))
  }

  get(id, next) {
    const query = "SELECT * FROM TABLE_REPORT WHERE ID = " + id
    db.executeNoBindReturnJson(query, this.transpose, next)
  }

  delete(id, next) {
    const query = "DELETE FROM TABLE_REPORT WHERE ID = " + id
    db.executeNoBindReturnJson(query, this.transpose, next)
  }

  all(next) {
    const query = "SELECT * FROM TABLE_REPORT"
    db.executeNoBindReturnJson(query, this.transpose, next)
  }
}

exports.Report = Report