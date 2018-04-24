var filters = {};

//Function to handle multiple filters
function aggregateFilter(){
  var rows = $("#fbody").find("tr").hide();
  
  var filtered = [];
  
  for(f in filters){
    //Check if 'All' is checked
    if($('#'+f+'_all').prop('checked')){
      filtered.push(rows);
    }
    else{
      var filtering = undefined;
      $.each(filters[f], function(i, v){
        if(v){
          if( f === 'm'){
            var temp = rows.filter(function(){
              var model = $(this)[0].cells[2].textContent;
              return (model === i) ? 1: 0;
            });
          }
          else if( f === 'p'){
            var temp = rows.filter(function(){
              var price = parseInt($(this)[0].cells[3].textContent.replace("$",""));
              var keys = i.split('-',2);
              var min = keys[0];
              var max = keys[1];
              return (price < max && price >= min) ? 1: 0;
            });
          }
          else if(f === 'search'){
            var r = new RegExp(v, 'i');
            var temp = rows.filter(function(){ return $(this).text().match(r); });
           }
          filtering = (!filtering) ? temp : filtering.add(temp);
        }
      });
      filtered.push(filtering);
    }
  }
  //Create final filter to show remaining rows
  var finalFilter;
  for( var i=0; i<filtered.length; i++){
    finalFilter = (!finalFilter) ? filtered[i] : filtered[i].filter(finalFilter);
  }
  if(finalFilter != null)
    finalFilter.show();
  else{
    rows.show();
  }
}

var spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1SBpnq-1z42t_VsqteTjQan1fNfcphb_jP17vZ48a-wM/pubhtml#';
var sheet_data;

function generateTable(){
  //populate table
  var textToInsert = [];
  var i = 0;
  var length = sheet_data.elements.length;
  for (var a = 0; a < length; a++) {
    //Generate entire table
    textToInsert[i++] = '<tr><td>';
    textToInsert[i++] = getData(a);
    textToInsert[i++] = '</td></tr>';
  }
  $("#fbody tr").remove();
  $("#fbody").append(textToInsert.join(''));
  textToInsert = null;
}

function loadData(data, tabletop){
  sheet_data = data['Sheet3'];
  console.log(sheet_data);
  
  var models = [];
  
  //populate table
  var textToInsert = [];
  var i = 0;
  var length = sheet_data.elements.length;
  for (var a = 0; a < length; a++) {
    //Generate entire table
    textToInsert[i++] = '<tr><td>';
    textToInsert[i++] = getData(a);
    textToInsert[i++] = '</td></tr>';
    
    //Get model data
    models.push( sheet_data.elements[a]['GPU Chip']);
  }
  $("#fbody").append(textToInsert.join(''));
  
  models = models.sort().filter(function(el,i,a){return i ==a.indexOf(el);});
  
  //Generate Model Filters
  var textToInsert2 = [];
  var i = 0;
  length = models.length;
  textToInsert2[i++] = '<li><input type="checkbox" id="m_all" checked="checked" class="m_filter"/><label for="m_all">All</label></li>';
  for(var a=0; a<length; a++){
    textToInsert2[i++] = '<li><input type="checkbox" id="m_'+a+'" m="'+models[a]+'" class="m_filter"/><label for="m_'+a+'">'+models[a]+'</label></li>';
  }
  $("#m-list").append(textToInsert2.join(''));
  
  //Add click event listener to Model Filters
  $("#m_all").click(selectCheckboxAll("m"));
  for( var n=0; n<length; n++){
    $("#m_"+n).click(createModelFilter(n));
  }
}

function init() {
  Tabletop.init( {
    key: spreadsheet_url,
    callback: loadData
  })
}

function getData(index){
  var sheet = sheet_data.elements[index];
  return '<input type="checkbox"/></td><td>' + sheet['Product Name'] + '</td><td>' + sheet['GPU Chip'] + '</td><td>' + sheet['Price'] + '</td><td><button>Add</button>';
}

$("#searchFilter").keyup(function(){
  if( !filters['search'] )
        filters['search'] = {};
  filters['search']['val'] = this.value;
  aggregateFilter();
});

function createPriceFilter(n) {
  return function(){
    var min = parseInt($("#p_"+n).attr('p-min'));
    var max = parseInt($("#p_"+n).attr('p-max'));
    if( $("#p_"+n).is(':checked')){
      if( !filters['p'] )
        filters['p'] = {}
      filters['p'][(min+'-'+max)] = 1;
      
      //uncheck 'All'
      $("#p_all").prop('checked', false);
    }
    else{
      if($('.p_filter:checked').length == 0){
        //check 'All'
        $("#p_all").prop('checked', true);
      }
      if( !filters['p'] )
        filters['p'] = {}
      filters['p'][(min+'-'+max)] = 0;
    }
    aggregateFilter();
  };
}

function createModelFilter(n) {
  return function(){
    var m = $("#m_"+n).attr('m');
    if( $("#m_"+n).is(':checked')){
      if( !filters['m'] )
        filters['m'] = {}
      filters['m'][m] = 1;
      
      //uncheck 'All'
      $("#m_all").prop('checked', false);
    }
    else{
      if($('.m_filter:checked').length == 0){
        //check 'All'
        $("#m_all").prop('checked', true);
      }
      if( !filters['m'] )
        filters['m'] = {}
      filters['m'][m] = 0;
    }
    aggregateFilter();
  };
}

function selectCheckboxAll(name){
  return function(){
    //Uncheck all others
    $("."+name+"_filter:checked").prop('checked',false);
    //Make it checked
    $("#"+name+"_all").prop('checked',true);
    //Set all filters to false
    for(var key in filters[name]){
      filters[name][key] = 0;
    }
    //update the table filter
    aggregateFilter();
  };
}

$(document).ready(function(){ 
  init();
  
  for( var n=1; n<5; n++){
    $("#p_"+n).click(createPriceFilter(n));
  }
  
  $("#p_all").click(selectCheckboxAll("p"));
  
  $(".title").click(function(){
    var list = $("#"+$(this).attr('data-id')+"-list");
    list.toggle();
    if(list.css('display') === 'none'){
      $(this).removeClass('arrow-down').addClass('arrow-up');
    }
    else{
      $(this).removeClass('arrow-up').addClass('arrow-down');
    }
  });
  
  $("th button").click(function(){
    var k = $(this).parent().attr('data-type');
    var dir = $(this).attr('data-dir');
    var sortfct = (dir === 'asc') ? function(a,b){return a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0;} : function(a,b){return a[k] < b[k] ? 1 : a[k] > b[k] ? -1 : 0;};
    sheet_data.elements.sort(sortfct);
    generateTable();
    aggregateFilter();
  });
});