const alertasService = require("./alertas.service");

async function listFarmaciaAlertas(req, res) {
  const alertas = await alertasService.listFarmaciaAlertas(req.user);

  return res.status(200).json({
    data: alertas,
  });
}

async function dismissFarmaciaAlerta(req, res) {
  const result = await alertasService.dismissFarmaciaAlerta({
    user: req.user,
    alertaId: req.params.alertaId,
  });

  return res.status(200).json({
    data: result,
  });
}

async function dismissAllFarmaciaAlertas(req, res) {
  const result = await alertasService.dismissAllFarmaciaAlertas(req.user);

  return res.status(200).json({
    data: result,
  });
}

module.exports = {
  listFarmaciaAlertas,
  dismissFarmaciaAlerta,
  dismissAllFarmaciaAlertas,
};
