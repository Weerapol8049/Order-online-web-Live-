let SERVER_DR_order = "https://starmark.work/OrderOnline_API_Orders/"; //Live
//let SERVER_DR_Stock = 'https://starmark.work/OrderOnline_API_Stock/';//Live

// let SERVER_DR_order = 'http://starmark.work/OrderOnline_API_Order_test/';
//let SERVER_DR_Stock = "https://starmark.work/OrderOnline_API_Stock_test/";
let SERVER_DR_Stock = 'http://localhost:31810/';

let API_STOCK_SERIES = SERVER_DR_order + "api/line/series";
let API_STOCK_MODEL = SERVER_DR_order + "api/line/model";
let API_STOCK_LOAD = SERVER_DR_Stock + "api/stock/officefur/load";
let API_STOCK_NORESERVE = SERVER_DR_Stock + "api/stock/officefur/noReserve";

let title_s = document.getElementsByTagName("title")[0].innerText;
let poolParm = sessionStorage.getItem("pool_line_val");
let seriesParm = sessionStorage.getItem("stock_series");
//let modelParm = sessionStorage.getItem("stock_model");

loadSeries("", "", "DOOR PANEL");

function getFilter(element) {
  return document.getElementById(element).value;
}
function onSearch() {
  document.getElementById("spinLoad").style.display = "block";
  document.getElementById("gridData").innerText = "";
  load(
    "DOOR PANEL",
    getFilter("series"),
    localStorage.getItem("usr_val"),
    localStorage.getItem("type_val")
  );
}

function loadSeries(selected, pooledit, pool_s) {
  let pool = pooledit == "" ? pool_s : pooledit;

  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", API_STOCK_SERIES);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(
    JSON.stringify({
      pool: pool
    })
  );
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //console.log(this.responseText);
      var trHTML = "";
      const objects = JSON.parse(this.responseText);

      trHTML += `<option value="" selected="selected">------ None ------</option>`;
      for (let object of objects) {
        let _series = object["ProdSeries"];

        if (selected == _series)
          trHTML += `<option value="${_series}" selected>${_series}</option>`;
        else trHTML += `<option value="${_series}">${_series}</option>`;
      }
      document.getElementById("series").innerHTML = trHTML;

      //loadItem(document.getElementById("pool").value, document.getElementById("series").value,"");
    }
  };
}

function load(pool, series, storeId, type) {
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", API_STOCK_LOAD);
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(
    JSON.stringify({
      pool: pool,
      series: series,
      storeId: storeId,
      type: type
    })
  );
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //<label>ยอดคงเหลือ : 220</label>
      let rowCount = 1;
      let trBody = "";
      let classexpend = "";

      const objects = JSON.parse(this.responseText);
      document.getElementById("gridData").innerHTML = "";
      trBody += `
            <table id="example1" class="table table-bordered table-hover" >
                        <thead>
                            <tr>
                                <th>ลำดับ</th>
                                <th>Model</th>
                                <th>Item Number</th>

                                <th style="display: flex; align-items: center; text-align: right; width: 150px;">
                                    <div class="col-lg-12" style="color:green;">สินค้าพร้อมขาย</div>
                                </th> 
                                <th style="display: flex; align-items: center; text-align: right; width: 150px;">
                                    <div class="col-lg-12" style="color:green;">สินค้ารอขาย</div>
                                </th> 
                                <th>Unit</th>
                            </tr>
                        </thead>
                        <tbody id="body-data" >
                        `;
      for (let data of objects) {
        let _seq = data["Seq"];
        let _model = data["Model"];
        let _itemid = data["ItemId"];
        let _name = data["Name"];
        let _phyInv = data["PhysicalInv"];
        let _onOrder = data["OnOrder"];
        let _unit = data["Unit"];
        let _NoReserve = data["NoReserve"];

        if (_seq > 0) {
          classexpend = ``;
          trBody += ` 
                    <tr >
                                    <td >${rowCount}</td>
                                    <td >${_model}</td>
                                    <td style="display: flex; align-items: center;">
                                        <div class="row">
                                            <div class="col-sm-12">
                                                ${classexpend}
                                                <strong>${_itemid}</strong> </br>
                                                 <small style="tab-size: 4;"> ${_name} </small>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="display: flex; align-items: center; text-align: right;">${numberFormat(
                                      _phyInv - _onOrder
                                    )}</td>
                                    <td style="display: flex; align-items: center; text-align: right; color:#339CFF; cursor:pointer;" 
                                      onclick='clickNoReserve("${_itemid}",${numberFormat(_NoReserve)});'>${numberFormat(_NoReserve)}</td>
                                    
                                    <td>${_unit}</td>
                                </tr>
                                `;
          rowCount++;
        }
      }

      document.getElementById("gridData").innerHTML = trBody;
      $("#example1")
        .DataTable({
          responsive: true,
          lengthChange: false,
          autoWidth: false,
          searching: true,
          paging: true,
          info: true,
          ordering: true
        })
        .buttons()
        .container()
        .appendTo("#example1_wrapper .col-md-6:eq(0)");

      document.getElementById("spinLoad").style.display = "none";
    }
  };
}

function clickNoReserve(itemId, qty) {
  let tableHTML = ``;
  if (qty) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", API_STOCK_NORESERVE);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(
      JSON.stringify({
        itemId: itemId
      })
    );
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const objects = JSON.parse(this.responseText);
        tableHTML += `<table id="example1" class="table table-bordered table-hover dataTable dtr-inline collapsed" aria-describedby="example1_info">
                <thead>
                    <tr>
                        <th style="font-size:14px;">ลำดับ</th>
                        <th style="font-size:14px;">Store</th>
                        <th style="font-size:14px;">Pool</th>
                        <th style="font-size:14px;">Customer</th>
                        <th style="font-size:14px;">Register number</th>
                        <th style="font-size:14px;">Qty</th>
                    </tr>
                </thead>
                <tbody >`;
        for (let data of objects) {
          let _seq = data["Seq"];
          let _store = data["Store"];
          let _pool = data["Pool"];
          let _custName = data["CustName"];
          let _bookingId = data["BookingId"];
          let _qty = data["Qty"];

          tableHTML += ` <tr >
                                        <td style="font-size:14px;">${_seq}</td>
                                        <td style="font-size:14px;">${_store}</td>
                                        <td style="font-size:14px;">${_pool}</td>
                                        <td style="font-size:14px;">${_custName}</td>
                                        <td style="font-size:14px;">${_bookingId}</td>
                                        <td style="font-size:14px;">${_qty}</td>
                                    </tr>`;
        }
        tableHTML += `</tbody>
                            </table>`;
      }

      Swal.fire({
        title: "<strong> สินค้ารอขาย </strong>",
        //icon: 'info',
        html: tableHTML,
        width: "1200px",
        showCloseButton: true
        //showCancelButton: true,
      });
    };
  }
}

function numberFormat(val) {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
