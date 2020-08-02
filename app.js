'use strict';

const fieldModel = document.querySelector('#fieldModel'),
  fieldBrand = document.querySelector('#fieldBrand'),
  fieldPrice = document.querySelector('#fieldPrice'),
  alert = document.querySelector('.alert');

let getDataToChart, //function
  getModelId, //function
  chartDataValue = [],
  chartLabels = []

const callApiFipe = (baseUrl, fn) => {

  fetch(baseUrl)
    .then(res => res.json())
    .then(data => fn(data))
    .catch(error => console.log(error));
}

const ApiFipeLists = (UrlName, brandId = false, modelId = false, yearId = false, isChart = false) => {

  const baseUrl = {
    listOfValueByYearOfLaunch: `https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandId}/modelos/${modelId}/anos/${yearId}`,
    listYearsOfLaunch: `https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandId}/modelos/${modelId}/anos`,
    ApilistModel: `https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandId}/modelos`,
    ApilistBrand: `https://parallelum.com.br/fipe/api/v1/carros/marcas`
  }

  let getDataApiFipe = receiveDataApiFipe(UrlName, isChart);
  callApiFipe(baseUrl[UrlName], getDataApiFipe);
}

let getDataCheckYearOfLaunchEqualYearCurrent;

const receiveDataApiFipe = (nameApi, isChart) => data => listDataApiFipeExec[nameApi](data, isChart);

const listDataApiFipeExec = {
  ApilistModel: ({ modelos } = data) => renderOptionsField(modelos, fieldModel, 'ApilistModel'),
  ApilistBrand: data => renderOptionsField(data, fieldBrand, 'ApilistBrand'),
  listYearsOfLaunch: data => getDataCheckYearOfLaunchEqualYearCurrent(data),
  listOfValueByYearOfLaunch: (data, isChart) => {
    if (isChart) {
      receiveDataValuesToChart(data);
    } else {
      renderOptionsField(data, fieldPrice, 'listOfValueByYearOfLaunch');
    }
  }
}

const renderOptionsField = (data, fieldContainer, UrlName) => {

  if (fieldContainer === fieldPrice) {
    const { Valor } = data;
    fieldPrice.value = Valor;

  } else {
    fieldContainer.innerHTML = '<option selected>Selecione uma opção...</option>';

    data.map((fieldData, i) => {
      const { nome, codigo } = fieldData;

      fieldContainer.innerHTML += ` 
          <option value=${codigo} data-index=${i + 1} data-name=${nome} data-urlname=${UrlName}>${nome}</option>
    `;
    });

    addEventClick(fieldContainer, UrlName);
  }
}

const addEventClick = (fieldContainer, UrlName) => {

  fieldContainer.addEventListener('change', (e) => {

    chartDataValue = [];
    chartLabels = [];

    if (UrlName === 'ApilistBrand') {
      let brandId = e.target.value;
      sendApiFipe('ApilistModel', brandId);
      getModelId = sendApilistYearsOfLaunch(brandId);

    } else if (UrlName === 'ApilistModel') {
      let modelId = e.target.value;
      getModelId(modelId);
    }
  });
}

const sendApiFipe = (UrlName, brandId = false, modelId = false, yearId = false, isChart = false) => {

  if (UrlName === 'ApilistBrand') {
    ApiFipeLists('ApilistBrand');

  } else if (UrlName === 'ApilistModel' && !modelId) {
    fieldModel.disabled = false;
    ApiFipeLists('ApilistModel', brandId);

  } else if (UrlName === 'listOfValueByYearOfLaunch') {
    ApiFipeLists('listOfValueByYearOfLaunch', brandId, modelId, yearId, isChart);
  }
}

const sendApilistYearsOfLaunch = brandId => {
  return (modelId) => {
    ApiFipeLists('listYearsOfLaunch', brandId, modelId);
    getDataCheckYearOfLaunchEqualYearCurrent = checkYearOfLaunchEqualYearCurrent(brandId, modelId);
  }
}

let dataLength; //Temp
const sendDataToChart = (data, brandId, modelId) => {

  dataLength = data.length
  data.forEach(({ codigo } = el) => {
    ApiFipeLists('listOfValueByYearOfLaunch', brandId, modelId, codigo, true);
  });
}

const checkYearOfLaunchEqualYearCurrent = (brandId, modelId) => {
  return (data) => {
    const yearCurrent = new Date().getFullYear();
    let yearId;

    let dataYearOfLaunch = data.filter(yearOfLaunch => {
      const { nome, codigo } = yearOfLaunch;

      let year = nome.replace(/\D/gim, '');
      if (parseInt(year) === yearCurrent) {
        return yearId = codigo;
      }
    });

    if (dataYearOfLaunch.length) {
      alert.classList.remove('show');
      sendApiFipe('listOfValueByYearOfLaunch', brandId, modelId, yearId, false);

    } else {
      alert.classList.add('show');
      fieldPrice.value = 'R$';
    }

    sendDataToChart(data, brandId, modelId);
  }
}

const receiveDataValuesToChart = data => {

  const { Valor, AnoModelo } = data;

  chartDataValue.push(Valor.replace(/\D/gim, ''));
  chartLabels.push(AnoModelo);

  if (chartDataValue.length === dataLength) {

    let chartInfo = [];
    let yearCurrent = new Date().getFullYear();

    new Array(chartDataValue.length).fill('').forEach((_, i) => {
      return chartInfo.push({ valor: chartDataValue[i], anoModelo: chartLabels[i] })
    });

    chartInfo.sort((a, b) => (a.anoModelo > b.anoModelo) ? 1 : ((b.anoModelo > a.anoModelo) ? -1 : 0));
    let filterYearModel = chartInfo.filter(el => el.anoModelo <= yearCurrent + 1);
    let labels = filterYearModel.map(el => el.anoModelo);
    let dataValues = filterYearModel.map(el => el.valor);

    loadChart(dataValues, labels);
  }
}

const loadChart = (dataValues, labels) => {

  const sectionCanvas = document.querySelector('#sectionCanvas');
  sectionCanvas.innerHTML = `<canvas id="myChart" width="300" height="100"></canvas>`

  let ctx = document.getElementById('myChart').getContext('2d');

  let chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: fieldModel.options[fieldModel.selectedIndex].innerHTML,
        backgroundColor: 'transparent',
        borderColor: 'red',
        data: dataValues
      }]
    },

    options: {}
  });
}

sendApiFipe('ApilistBrand');










