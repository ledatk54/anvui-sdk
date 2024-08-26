const API_TEST_BASE_URL = 'https://api-test.anvui.vn/v1'
const API_PROD_BASE_URL = 'https://api.anvui.vn/v1'
const WEB_BASE_URL = 'https://xeanvui.phanmemnhaxe.vn'

let listPointData = []
let listPointAliasData = []
let listPointById = {}
let listPointsByProvinceData = [];

const fixTitle = (title, strtolower = true) => {
    let str = title.toLowerCase();
    // xóa dấu
    str = str
        .normalize("NFD") // chuyển chuỗi sang unicode tổ hợp
        .replace(/[\u0300-\u036f]/g, ""); // xóa các ký tự dấu sau khi tách tổ hợp
    // Thay ký tự đĐ
    str = str.replace(/[đĐ]/g, "d");
    // Xóa ký tự đặc biệt
    str = str.replace(/([^0-9a-z-\s])/g, "");
    // Xóa khoảng trắng thay bằng ký tự -
    str = str.replace(/(\s+)/g, "-");
    // Xóa ký tự - liên tiếp
    str = str.replace(/-+/g, "-");
    // xóa phần dư - ở đầu & cuối
    str = str.replace(/^-+|-+$/g, "");
    // return
    return str;
};
const listify = (obj, mapFn) =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    acc.push(mapFn(key, value));
    return acc;
}, []);

const getListRoute = (companyId, callback) => {
    console.log("callback",callback)
    const params = {
        page: 0,
        count: 500,
        companyId: companyId,
        platform: 2
    }
    const url = `${API_TEST_BASE_URL}/route/getList`;
    $.ajax({
        method: "POST",
        url: url,
        data: JSON.stringify(params),
        headers: {
            "Content-Type": "application/json",
        },
        success: function (data) {
            if (data.code === 200) {
                const resultPoint = data.results.result || [];
                listPointData = resultPoint
                .map((item) =>
                    item.listPoint ? item.listPoint : item.listPointCache || []
                )
                .flat(1);
                const uniqueListPoints = listPointData.filter(
                (v, i, a) =>
                    a.findIndex((v2) => v2.id === v.id) === i
                );
                listPointAliasData = uniqueListPoints.map((item, index) => {
                    const itemClone = { ...item };
                    itemClone.index = index;
                    itemClone.alias = fixTitle(item.name);
                    itemClone.listRoute = [item.routeId];
                    itemClone.listRouteText = itemClone.listRoute.join(',');
                    listPointById[item.id] = itemClone
                    return itemClone;
                });
                const groupByCategory = listPointAliasData.reduce((group, product) => {
                    const { province } = product;
                    group[province] = group[province] ?? [];
                    group[province].push(product);
                    return group;
                }, {});
                listPointsByProvinceData = listify(
                    groupByCategory,
                    (key, value) => ({
                        name: key,
                        listPoints: [...value],
                    })
                );
                callback()
            }
            console.log(data);
            console.log('listPointData',listPointData);
            console.log('listPointAliasData',listPointAliasData);
            console.log('listPointsByProvinceData',listPointsByProvinceData);
            
        },
        error: function () {
          console.log('error')
        },
      });
}

function loadScriptsAndStyles(companyId, callback) {
  // Tải jQuery
  var scriptJQuery = document.createElement("script");
  scriptJQuery.src = "https://code.jquery.com/jquery-3.6.0.min.js";
  scriptJQuery.onload = function () {
    // Tải Select2 sau khi jQuery đã tải xong
    var scriptSelect2 = document.createElement("script");
    scriptSelect2.src =
      "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js";
    scriptSelect2.onload = function () {
        // Tải CSS cho Select2
        var linkSelect2CSS = document.createElement("link");
        linkSelect2CSS.rel = "stylesheet";
        linkSelect2CSS.href ="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css";
        var linkFontCSS = document.createElement("link");
        linkFontCSS.rel = "stylesheet";
        linkFontCSS.href ="https://fonts.googleapis.com/css?family=Cabin:400,500,600,700&display=swap&subset=vietnamese";
        var scriptDatePicker = document.createElement("script");
        scriptDatePicker.src =
        "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.10.0/js/bootstrap-datepicker.min.js";
        scriptDatePicker.onload = function () { 
            var linkDatePickerCss = document.createElement("link");
            linkDatePickerCss.rel = "stylesheet";
            linkDatePickerCss.href = "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.10.0/css/bootstrap-datepicker.min.css";
            document.head.appendChild(linkSelect2CSS);
            document.head.appendChild(linkFontCSS);
            document.head.appendChild(linkDatePickerCss);
            var linkPluginCSS = document.createElement("link");
            linkPluginCSS.rel = "stylesheet";
            linkPluginCSS.href = "css/anvui-search.css";
            document.head.appendChild(linkPluginCSS);
            getListRoute(companyId, callback)

        }
        document.head.appendChild(scriptDatePicker);
        
    };
    document.head.appendChild(scriptSelect2);
  };
  document.head.appendChild(scriptJQuery);
}
Date.prototype.getDateDDMMYYYY = function(type = 1){

    var yyyy = this.getFullYear().toString();                                    
    let dd = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
    let mm = (this.getMonth() + 1) < 10 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1);

    
    if(type == 1) {
        return `${dd}${mm}${yyyy}`;
    }
    
    return `${dd}/${mm}/${yyyy}`;
}
class SearchTicket{

    constructor(config = {}) 
    {
        this.config = config;

        config.wrap ? this.wrap = config.wrap : this.wrap = "";
        config.target ? this.target = config.target : this.target = "_SELF";
        config.pointUpSelector ? this.pointUpSelector = config.pointUpSelector : this.pointUpSelector = ".pointUp";
        config.pointDownSelector ? this.pointDownSelector = config.pointDownSelector : this.pointDownSelector = ".pointDown";
        config.dateSelector ? this.dateSelector = config.dateSelector : this.dateSelector = ".ticket-date";
        config.timeSelector ? this.timeSelector = config.timeSelector : this.timeSelector = ".ticket-time";
        config.numberSeatSelector ? this.numberSeatSelector = config.numberSeatSelector : this.numberSeatSelector = ".number-seat";

        config.triggleSearchTicket ? this.triggleSearchTicket = config.triggleSearchTicket : this.triggleSearchTicket = "[data-action=searchTripBasic]";
        

        let dateObj = new Date();
        let now = dateObj.getDateDDMMYYYY(2);

        config.pointUpData() ? this.pointUpData = config.pointUpData() : this.pointUpData = "";
        config.pointDownData() ? this.pointDownData = config.pointDownData() : this.pointDownData = "";
        config.dateData() ? this.dateData = config.dateData() : this.dateData = now;
        config.timeData() ? this.timeData = config.timeData() : this.timeData = "none";
        config.numberSeatData() ? this.numberSeatData = config.numberSeatData() : this.numberSeatData = "";
        if(this.numberSeatData != "" && this.numberSeatData <= 0) {
            this.numberSeatData = ""
        }

        config.toggleResetSelector ? this.toggleResetSelector = config.toggleResetSelector : this.toggleResetSelector = '[data-action=resetSearch]';

        config.textPointUpSelector ? this.textPointUpSelector = config.textPointUpSelector : this.textPointUpSelector = "[data-point-target=pointUp]";
        config.textStartTimeSelector ? this.textStartTimeSelector = config.textStartTimeSelector : this.textStartTimeSelector = "[data-content=startTime]";
        config.textPointDownSelector ? this.textPointDownSelector = config.textPointDownSelector : this.textPointDownSelector = "[data-point-target=pointDown]";

        if(config.listPointById) {
            this.listPointById = config.listPointById()
            this.usePointIndex = true
        } else {
            this.listPointById = {};
            this.usePointIndex = false
        }
        this.innitConfigDatePicker()
        this.initConfig();
        this.innitConfigSelect2()
        this.initPointClickEvent();   
    }

    

    validate()
    {
        let pointUpDOM = $(this.getPointUpSelector());
        let pointDownDOM = $(this.getPointUpSelector());
        let errorBagSelector = [];

        if(this.pointUpData == "") {
            errorBagSelector.push(this.getTextPointUpSelector())
        }

        if(this.pointDownData == "") {
            errorBagSelector.push(this.getTextPointDownSelector())
        }

        if(errorBagSelector.length > 0) {
            return { status: false, data: errorBagSelector };
        }
        return { status: true, data: [] };
    }

    getTextPointUpSelector()
    {
        return `${this.wrap} ${this.textPointUpSelector}`;
    }

    getTextPointDownSelector()
    {
        return `${this.wrap} ${this.textPointDownSelector}`;
    }

    getPointUpSelector()
    {
        return `${this.wrap} ${this.pointUpSelector}`;
    }

    getPointDownSelector()
    {
        return `${this.wrap} ${this.pointDownSelector}`;
    }

    static changeFormatToDisplay(dateString)
    {
        if( dateString.length == 8 ) {
            let year = `${dateString[0]}${dateString[1]}${dateString[2]}${dateString[3]}`;
            let month = `${dateString[4]}${dateString[5]}`;
            let day = `${dateString[6]}${dateString[7]}`;

            return `${day}/${month}/${year}`;            
        }

        return '01/01/2019'
        
    }
    
    static changeFormatToDateParam(dateString)
    {
        let dateArray = dateString.split("/");
        if(dateArray.length == 3) {
            let yyyy = dateArray[2]; 
            let mm = dateArray[1].length < 2 ? "0" + dateArray[1] : dateArray[1]; 
            let dd = dateArray[0].length < 2 ? "0" + dateArray[0] : dateArray[0]; 

            return `${yyyy}${mm}${dd}`;    
        }

        return '20190101';
        
    }

    getPointUp()
    {
        return this.pointUpData;
    }

    getPointDown()
    {
        return this.pointDownData;
    }

    getDate()
    {
        return this.dateData;
    }

    getUrlToSearch()
    {   
        if(this.timeData == 'none') this.timeData = 0;
        let pointUpAlias = this.listPointById[this.pointUpData]['alias']
        let pointUpIndex = this.listPointById[this.pointUpData]['index']
        let pointDownAlias = this.listPointById[this.pointDownData]['alias']
        let pointDownIndex = this.listPointById[this.pointDownData]['index']

        let url = `/dat-ve/ve-xe-tu-${pointUpAlias.trim()}-den-${pointDownAlias.trim()}-${pointUpIndex}d${pointDownIndex}.html?date=${SearchTicket.changeFormatToDateParam(this.dateData)}`
        
        if(this.timeData != 0) {
            url += `&time=${this.timeData}`
        } 

        if(this.numberSeatData != "") {
            url += `&totalEmptySeat=${this.numberSeatData}`
        } 

        return url
    }

    innitConfigDatePicker()
    {
        var today = new Date();

        $(`${this.wrap} ${this.dateSelector}`).datepicker({
            format: 'dd/mm/yyyy',
            startDate: today,
            todayHighlight:true,
            orientation: 'bottom',
            autoclose: true,
        });

        $(`${this.wrap} ${this.dateSelector}`).datepicker('setDate', today);
    }

    innitConfigSelect2()
    {
        let pointUpDom = $(`${this.wrap} ${this.pointUpSelector}`);
        let pointDownDom = $(`${this.wrap} ${this.pointDownSelector}`);

        $(`${this.wrap} ${this.textPointUpSelector}`).html( $(`${this.wrap} ${this.pointUpSelector} option:selected`).text());
        $(`${this.wrap} ${this.textPointDownSelector}`).html( $(`${this.wrap} ${this.pointDownSelector} option:selected`).text());

        console.log($(`${this.wrap} ${this.pointUpSelector} option:selected`).text())
        pointUpDom.select2({
            allowClear: true,
            templateResult: function(state) {
                var $state = $(
                    `<span data-content="pointUpOption" data-point-id="${$(state.element).val()}" data-route-id="${$(state.element).attr('data-route-id')}">` + state.text + '</span>'
                );
                return $state;
            }
        });
 
        pointDownDom.select2({
            allowClear: true,
            templateResult: function(state) {
                var $state = $(
                    `<span data-content="pointDownOption" data-point-id="${$(state.element).val()}" data-route-id="${$(state.element).attr('data-route-id')}">` + state.text + '</span>'
                );
                return $state;
            }
        });

        pointUpDom.on('select2:select', (e) => {
            var data = e.params.data;
            $(`${this.wrap} ${this.textPointUpSelector}`).html(data.text.trim());
        });

        pointDownDom.on('select2:select', (e) => {
            var data = e.params.data;
            $(`${this.wrap} ${this.textPointDownSelector}`).html(data.text.trim());
        });
    }

    setPointUp(pointId) {
        let pointUpDom = $(`${this.wrap} ${this.pointUpSelector}`);
        pointUpDom.val(this.pointUpData)
        pointUpDom.select2().trigger('change'); 
    }


    initConfig()
    {
        let pointUpDom = $(`${this.wrap} ${this.pointUpSelector}`);
        let pointDownDom = $(`${this.wrap} ${this.pointDownSelector}`);

        pointUpDom.val(this.pointUpData)
        pointUpDom.select2().trigger('change'); 
        $(`${this.wrap} ${this.textPointUpSelector}`).html(this.pointUpData);

        pointDownDom.val(this.pointDownData)
        pointDownDom.select2().trigger('change');   
        $(`${this.wrap} ${this.textPointDownSelector}`).html(this.pointDownData);

        $(`${this.wrap} ${this.dateSelector}`).val(this.dateData);

    

        $(`${this.wrap} ${this.numberSeatSelector}`).val( this.numberSeatData )

        let dateAsArray = this.dateData.split('/');
        // $(`${this.wrap} ${this.dateSelector}`).datepicker("setDate", $.datepicker.parseDate( "dd-mm-yy", `${dateAsArray[0]}-${dateAsArray[1]}-${dateAsArray[2]}`));
        $(`${this.wrap} ${this.dateSelector}`).datepicker("setDate", new Date(dateAsArray[2], dateAsArray[1] - 1, dateAsArray[0]));


    }

    getListPointDownByRoute (routeSelectedArr) {
        let  listPointDown = []
        $(`[role=option] [data-content=pointDownOption]`).each((ind, elem) => {
            let listRoutePointDown = $(elem).attr('data-route-id')
            
            if(listRoutePointDown) {
                let listRoutePointDownArr = listRoutePointDown.split(',')
                let totalRouteArr = [...routeSelectedArr, ...listRoutePointDownArr]
                let totalRoute = routeSelectedArr.length + listRoutePointDownArr.length

                if( [...new Set(totalRouteArr)].length != totalRoute ) {
                    listPointDown.push(elem)
                }
            }
        })

        return listPointDown
    }


    // hideProvin () {
    //     let numberPoint = $('.select2-results__option [role=group]').find('li[role=option]').length
    //     let numberPointShow = $('.select2-results__option [role=group]').find('li[role=option][data-point-status=true]').length
    // }

    initPointClickEvent()
    {
        let pointUpDOM = $(`${this.wrap} ${this.pointUpSelector}`);
        let pointDownDOM = $(`${this.wrap} ${this.pointDownSelector}`);
        let triggleSearchTicketDOM = $(`${this.wrap} ${this.triggleSearchTicket}`);
        let toggleResetSelector = $(`${this.wrap} ${this.toggleResetSelector}`);
        let dateDom = $(`${this.wrap} ${this.dateSelector}`);
        let timeDom = $(`${this.wrap} ${this.timeSelector}`);
        let numberSeatDom = $(`${this.wrap} ${this.numberSeatSelector}`);
        var listRouteSelected = null
        
        triggleSearchTicketDOM.on("click", (e) => {   
            let url = `${this.getUrlToSearch()}`
            let validator = this.validate();

            if(!validator.status) {
                validator['data'].forEach(function(value){
                    $(value).addClass('invalid');
                })
                return false;       
            }
            const loader = document.getElementById('loader');  

            window.open(`${WEB_BASE_URL}${url}`, this.target)     
        });

        toggleResetSelector.on("click", (e) => {                
            this.pointUpData = "";
            $(`${this.wrap} ${this.textPointUpSelector}`).text("Chọn điểm lên")
            this.pointDownData = "";
            $(`${this.wrap} ${this.textPointDownSelector}`).text("Chọn điểm đến")

        });

        pointUpDOM.on("change", (e) => { 

            this.pointUpData = pointUpDOM.val();

            listRouteSelected = $( pointUpDOM.select2('data')[0].element ).attr('data-route-id')
            console.log(pointUpDOM.select2('data')[0].element)

            if(pointDownDOM.val() == "") {
                pointDownDOM.select2('open'); 
            }

            setTimeout(() => {  
                let listPointDown = this.getListPointDownByRoute(listRouteSelected.split(","))

                if(listRouteSelected) {
                    $(`[role=option] [data-content=pointDownOption]`).parent().hide()
                    $(`[role=option] [data-content=pointDownOption]`).parent().attr('data-point-status', false)
                    
                    listPointDown.forEach(function(elem){
                        $(elem).parent().show()
                        $(elem).parent().attr('data-point-status', true)
                    })
                    
                    $(`[role=option] [data-content=pointDownOption][data-point-id=${pointUpDOM.val()}]`).parent().hide()
                    $(`[role=option] [data-content=pointDownOption][data-point-id=${pointUpDOM.val()}]`).parent().attr('data-point-status', false)
                }

            }, 80);


            if( pointUpDOM.val() != "" ) {
                $(this.getTextPointUpSelector()).removeClass('invalid')
            } else {
                $(this.getTextPointUpSelector()).addClass('invalid')
            }
        });

        pointDownDOM.on("select2:open", (e) => {  
            setTimeout(() => {  
                let listPointDown = this.getListPointDownByRoute(listRouteSelected.split(","))

                if(listRouteSelected) {
                    $(`[role=option] [data-content=pointDownOption]`).parent().hide()
                    
                    listPointDown.forEach(function(elem){
                        $(elem).parent().show()
                    })

                    $(`[role=option] [data-content=pointDownOption][data-point-id=${pointUpDOM.val()}]`).parent().hide()
                }
            }, 80);
        });

        pointDownDOM.on("change", (e) => { 
            this.pointDownData = pointDownDOM.val();
            $(this.getTextPointDownSelector()).removeClass('invalid')

        });

        dateDom.on("change", (e) => { 
            this.dateData = dateDom.val()
        });

        numberSeatDom.on("change", (e) => { 
            this.numberSeatData = numberSeatDom.val()

            // timeDom.focus();   
        });


    }
}
function initializePlugin() {
  var searchPluginContainer = document.getElementById("anvui-root");
  const pointUpSelect = ['<option value="">Chọn điểm đi</option>']
  const pointDownSelect = ['<option value="">Chọn điểm đến</option>']
  listPointsByProvinceData.map((item) => {
    const options = [];
    item.listPoints.map((point) => {
        options.push(`<option value="${point.id}" data-route-id="${point.listRouteText}">${point.name}</option>`)
    })
    pointUpSelect.push(`<optgroup label="${item.name}">${options.join('')}</optgroup>`)
    pointDownSelect.push(`<optgroup label="${item.name}">${options.join('')}</optgroup>`)
  })

  searchPluginContainer.innerHTML = `<section class="filterTrip wow fadeInUp" style="visibility: visible; animation-name: fadeInUp;">
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-12 col-md-1 col-lg-1"></div>
            <div class="col-xs-12 col-sm-12 col-md-10 col-lg-10 mode__frame__col-12">
                <div class="filterTrip__wrap">
                    <div class="searchTicket" id="js-SearchTicket">
                        <div class="searchTicket__item">
                            <div class="searchTicket__item__left">
                                <span class="avicon icon-mark"></span>
                            </div>
                            <div class="searchTicket__item__right" data-select2-id="88">
                                <span class="searchTicket__item__title">Điểm đi</span>
                                <h3 data-point-target="pointUp">Chọn điểm lên</h3>
                                <select class="pointUp select2-hidden-accessible" tabindex="-1" aria-hidden="true" style="">${pointUpSelect.join('')}</select>
                            </div>
                        </div>
                        <div class="searchTicket__item">
                            <div class="searchTicket__item__left">
                                <span class="avicon icon-mark"></span>
                            </div>
                            <div class="searchTicket__item__right">
                                <span class="searchTicket__item__title">Điểm đến</span>
                                <h3 data-point-target="pointDown">Chọn điểm đến</h3>
                                <select class="pointDown select2-hidden-accessible" tabindex="-1" aria-hidden="true" style="">${pointDownSelect.join('')}</select>
                            </div>
                        </div>
                        <div class="searchTicket__item">
                            <div class="searchTicket__item__left">
                                <span class="avicon icon-calendar"></span>
                            </div>
                            <div class="searchTicket__item__right">
                                <span class="searchTicket__item__title">Ngày khởi hành</span>
                                <input class="ticket-date" readonly="readOnly">
                            </div>
                        </div>
                         
                        <div class="searchTicket__search">
                            <button data-action="searchTrip"><span class="avicon icon-search"></span>Tìm chuyến</button>
                        </div>
                    </div>
                    <div class="filterTrip__booking-step">
                        <h3 style="text-transform: uppercase;">DỄ DÀNG ĐẶT XE TRÊN WEBSITE</h3>
                        <div class="filterTrip__booking-step__content">
                            <div class="filterTrip__booking-step__item">
                                <span class="avicon"><svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle opacity="0.8" cx="30" cy="30" r="30" fill="#FAE8CA"></circle>
<path d="M30 28C30.6593 28 31.3037 27.8045 31.8519 27.4382C32.4001 27.072 32.8273 26.5514 33.0796 25.9423C33.3319 25.3332 33.3979 24.663 33.2693 24.0164C33.1407 23.3698 32.8232 22.7758 32.357 22.3096C31.8908 21.8435 31.2969 21.526 30.6503 21.3974C30.0037 21.2688 29.3335 21.3348 28.7244 21.5871C28.1153 21.8394 27.5947 22.2666 27.2284 22.8148C26.8622 23.3629 26.6667 24.0074 26.6667 24.6667C26.6667 25.5507 27.0178 26.3986 27.643 27.0237C28.2681 27.6488 29.1159 28 30 28ZM28.8167 39.5167C28.9716 39.6729 29.1559 39.7969 29.359 39.8815C29.5621 39.9661 29.78 40.0097 30 40.0097C30.22 40.0097 30.4379 39.9661 30.641 39.8815C30.844 39.7969 31.0284 39.6729 31.1833 39.5167L38 32.6833C39.5832 31.1009 40.6616 29.0845 41.0988 26.8891C41.5359 24.6937 41.3121 22.418 40.4558 20.3498C39.5994 18.2816 38.149 16.5138 36.2878 15.2701C34.4267 14.0263 32.2385 13.3625 30 13.3625C27.7615 13.3625 25.5733 14.0263 23.7122 15.2701C21.851 16.5138 20.4005 18.2816 19.5442 20.3498C18.6878 22.418 18.4641 24.6937 18.9012 26.8891C19.3383 29.0845 20.4167 31.1009 22 32.6833L28.8167 39.5167ZM22.05 23.9C22.1639 22.7117 22.5417 21.5638 23.1559 20.5402C23.77 19.5166 24.6051 18.643 25.6 17.9833C26.907 17.1252 28.4364 16.6679 30 16.6679C31.5635 16.6679 33.093 17.1252 34.4 17.9833C35.3883 18.6407 36.2186 19.509 36.8312 20.5256C37.4438 21.5423 37.8236 22.682 37.9431 23.863C38.0626 25.0439 37.919 26.2366 37.5225 27.3554C37.126 28.4742 36.4865 29.4912 35.65 30.3333L30 35.9833L24.35 30.3333C23.5125 29.4994 22.8715 28.4892 22.4737 27.3763C22.0758 26.2635 21.9311 25.0759 22.05 23.9ZM41.6667 43.3333H18.3333C17.8913 43.3333 17.4674 43.5089 17.1548 43.8215C16.8423 44.134 16.6667 44.558 16.6667 45C16.6667 45.442 16.8423 45.866 17.1548 46.1785C17.4674 46.4911 17.8913 46.6667 18.3333 46.6667H41.6667C42.1087 46.6667 42.5326 46.4911 42.8452 46.1785C43.1577 45.866 43.3333 45.442 43.3333 45C43.3333 44.558 43.1577 44.134 42.8452 43.8215C42.5326 43.5089 42.1087 43.3333 41.6667 43.3333Z" fill="#FFA000"></path>
</svg></span>
                                <p>Chọn thông tin hành trình và ấn Tìm chuyến</p>
                            </div>
                            <span class="avicon avicon-step icon-arrow-right-bg"></span>
                            <div class="filterTrip__booking-step__item">
                                                                <span class="avicon">
<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="30" cy="30" r="30" fill="#FAE8CA"></circle>
<path d="M45.0067 23.2917V20C45.0067 16.3233 42.0167 13.3333 38.34 13.3333H21.6733C17.9967 13.3333 15.0067 16.3233 15.0067 20V23.33L14.88 23.3367C14.4597 23.367 14.0664 23.5555 13.7795 23.8641C13.4925 24.1727 13.3331 24.5786 13.3333 25V28.3333C13.3333 28.7754 13.5089 29.1993 13.8215 29.5118C14.134 29.8244 14.558 30 15 30H15.0067V40C15.0067 41.225 15.6783 42.2867 16.6667 42.8667V45C16.6667 45.442 16.8423 45.866 17.1548 46.1785C17.4674 46.4911 17.8913 46.6667 18.3333 46.6667H20C20.442 46.6667 20.8659 46.4911 21.1785 46.1785C21.4911 45.866 21.6667 45.442 21.6667 45V43.3333H38.3333V45C38.3333 45.442 38.5089 45.866 38.8215 46.1785C39.134 46.4911 39.558 46.6667 40 46.6667H41.6667C42.1087 46.6667 42.5326 46.4911 42.8452 46.1785C43.1577 45.866 43.3333 45.442 43.3333 45V42.8733C43.84 42.5835 44.2614 42.1654 44.5552 41.661C44.8489 41.1566 45.0046 40.5837 45.0067 40V30C45.4487 30 45.8726 29.8244 46.1852 29.5118C46.4977 29.1993 46.6733 28.7754 46.6733 28.3333V25.1033C46.6925 24.8447 46.6514 24.5851 46.5533 24.345C46.215 23.5333 45.495 23.3383 45.0067 23.2917ZM41.6767 40H18.34V31.6667H41.675L41.6767 40ZM28.34 21.6667V28.3333H18.34V21.6667H28.34ZM41.6733 21.6667V28.3333H31.6733V21.6667H41.6733ZM21.6733 16.6667H38.34C39.5667 16.6667 40.6317 17.3417 41.21 18.3333H18.8033C19.3817 17.3417 20.4467 16.6667 21.6733 16.6667Z" fill="#FFA000"></path>
<path d="M22.5 38.3333C23.8807 38.3333 25 37.214 25 35.8333C25 34.4526 23.8807 33.3333 22.5 33.3333C21.1193 33.3333 20 34.4526 20 35.8333C20 37.214 21.1193 38.3333 22.5 38.3333Z" fill="#FFA000"></path>
<path d="M37.5 38.3333C38.8807 38.3333 40 37.214 40 35.8333C40 34.4526 38.8807 33.3333 37.5 33.3333C36.1193 33.3333 35 34.4526 35 35.8333C35 37.214 36.1193 38.3333 37.5 38.3333Z" fill="#FFA000"></path>
</svg>
</span>
                                                                <p>Chọn chuyến, chỗ ngồi phù hợp và điền thông tin</p>
                            </div>
                            <span class="avicon avicon-step icon-arrow-right-bg"></span>
                            <div class="filterTrip__booking-step__item">
                                <span class="avicon">
<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="30" cy="30" r="30" fill="#FAE8CA"></circle>
<path d="M43.3333 16.6667H16.6667C14.8283 16.6667 13.3333 18.1617 13.3333 20V40C13.3333 41.8383 14.8283 43.3333 16.6667 43.3333H43.3333C45.1717 43.3333 46.6667 41.8383 46.6667 40V20C46.6667 18.1617 45.1717 16.6667 43.3333 16.6667ZM16.6667 20H43.3333V23.3333H16.6667V20ZM16.6667 40V30H43.335L43.3367 40H16.6667Z" fill="#FFA000"></path>
<path d="M20 33.3333H30V36.6667H20V33.3333Z" fill="#FFA000"></path>
</svg></span>
                                <p>Tiến hành thanh toán online</p>
                            </div>
                            <span class="avicon avicon-step icon-arrow-right-bg"></span>
                            <div class="filterTrip__booking-step__item">
                                <span class="avicon"><svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="30" cy="30" r="30" fill="#FAE8CA"></circle>
<path d="M25 26.6667C24.558 26.6667 24.1341 26.8423 23.8215 27.1548C23.5089 27.4674 23.3333 27.8913 23.3333 28.3333V31.6667C23.3333 32.1087 23.5089 32.5326 23.8215 32.8452C24.1341 33.1577 24.558 33.3333 25 33.3333C25.442 33.3333 25.866 33.1577 26.1785 32.8452C26.4911 32.5326 26.6667 32.1087 26.6667 31.6667V28.3333C26.6667 27.8913 26.4911 27.4674 26.1785 27.1548C25.866 26.8423 25.442 26.6667 25 26.6667ZM45 28.3333C45.442 28.3333 45.866 28.1577 46.1785 27.8452C46.4911 27.5326 46.6667 27.1087 46.6667 26.6667V20C46.6667 19.558 46.4911 19.1341 46.1785 18.8215C45.866 18.5089 45.442 18.3333 45 18.3333H15C14.558 18.3333 14.1341 18.5089 13.8215 18.8215C13.5089 19.1341 13.3333 19.558 13.3333 20V26.6667C13.3333 27.1087 13.5089 27.5326 13.8215 27.8452C14.1341 28.1577 14.558 28.3333 15 28.3333C15.442 28.3333 15.866 28.5089 16.1785 28.8215C16.4911 29.1341 16.6667 29.558 16.6667 30C16.6667 30.442 16.4911 30.866 16.1785 31.1785C15.866 31.4911 15.442 31.6667 15 31.6667C14.558 31.6667 14.1341 31.8423 13.8215 32.1548C13.5089 32.4674 13.3333 32.8913 13.3333 33.3333V40C13.3333 40.442 13.5089 40.866 13.8215 41.1785C14.1341 41.4911 14.558 41.6667 15 41.6667H45C45.442 41.6667 45.866 41.4911 46.1785 41.1785C46.4911 40.866 46.6667 40.442 46.6667 40V33.3333C46.6667 32.8913 46.4911 32.4674 46.1785 32.1548C45.866 31.8423 45.442 31.6667 45 31.6667C44.558 31.6667 44.1341 31.4911 43.8215 31.1785C43.5089 30.866 43.3333 30.442 43.3333 30C43.3333 29.558 43.5089 29.1341 43.8215 28.8215C44.1341 28.5089 44.558 28.3333 45 28.3333ZM43.3333 25.3C42.3681 25.6503 41.5341 26.2894 40.9447 27.1303C40.3554 27.9712 40.0392 28.9731 40.0392 30C40.0392 31.0269 40.3554 32.0288 40.9447 32.8697C41.5341 33.7106 42.3681 34.3497 43.3333 34.7V38.3333H26.6667C26.6667 37.8913 26.4911 37.4674 26.1785 37.1548C25.866 36.8423 25.442 36.6667 25 36.6667C24.558 36.6667 24.1341 36.8423 23.8215 37.1548C23.5089 37.4674 23.3333 37.8913 23.3333 38.3333H16.6667V34.7C17.6319 34.3497 18.4659 33.7106 19.0553 32.8697C19.6446 32.0288 19.9608 31.0269 19.9608 30C19.9608 28.9731 19.6446 27.9712 19.0553 27.1303C18.4659 26.2894 17.6319 25.6503 16.6667 25.3V21.6667H23.3333C23.3333 22.1087 23.5089 22.5326 23.8215 22.8452C24.1341 23.1577 24.558 23.3333 25 23.3333C25.442 23.3333 25.866 23.1577 26.1785 22.8452C26.4911 22.5326 26.6667 22.1087 26.6667 21.6667H43.3333V25.3Z" fill="#FFA000"></path>
</svg></span>
                                <p>Nhận mã và lên xe</p>
                            </div>
                        </div>

                        <div class="filterTrip__booking-step__content--mobile">
                            <div class="filterTrip__booking-step__content--mobile__icon-line">
                                <span class="avicon"><svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle opacity="0.8" cx="30" cy="30" r="30" fill="#FAE8CA"></circle>
<path d="M30 28C30.6593 28 31.3037 27.8045 31.8519 27.4382C32.4001 27.072 32.8273 26.5514 33.0796 25.9423C33.3319 25.3332 33.3979 24.663 33.2693 24.0164C33.1407 23.3698 32.8232 22.7758 32.357 22.3096C31.8908 21.8435 31.2969 21.526 30.6503 21.3974C30.0037 21.2688 29.3335 21.3348 28.7244 21.5871C28.1153 21.8394 27.5947 22.2666 27.2284 22.8148C26.8622 23.3629 26.6667 24.0074 26.6667 24.6667C26.6667 25.5507 27.0178 26.3986 27.643 27.0237C28.2681 27.6488 29.1159 28 30 28ZM28.8167 39.5167C28.9716 39.6729 29.1559 39.7969 29.359 39.8815C29.5621 39.9661 29.78 40.0097 30 40.0097C30.22 40.0097 30.4379 39.9661 30.641 39.8815C30.844 39.7969 31.0284 39.6729 31.1833 39.5167L38 32.6833C39.5832 31.1009 40.6616 29.0845 41.0988 26.8891C41.5359 24.6937 41.3121 22.418 40.4558 20.3498C39.5994 18.2816 38.149 16.5138 36.2878 15.2701C34.4267 14.0263 32.2385 13.3625 30 13.3625C27.7615 13.3625 25.5733 14.0263 23.7122 15.2701C21.851 16.5138 20.4005 18.2816 19.5442 20.3498C18.6878 22.418 18.4641 24.6937 18.9012 26.8891C19.3383 29.0845 20.4167 31.1009 22 32.6833L28.8167 39.5167ZM22.05 23.9C22.1639 22.7117 22.5417 21.5638 23.1559 20.5402C23.77 19.5166 24.6051 18.643 25.6 17.9833C26.907 17.1252 28.4364 16.6679 30 16.6679C31.5635 16.6679 33.093 17.1252 34.4 17.9833C35.3883 18.6407 36.2186 19.509 36.8312 20.5256C37.4438 21.5423 37.8236 22.682 37.9431 23.863C38.0626 25.0439 37.919 26.2366 37.5225 27.3554C37.126 28.4742 36.4865 29.4912 35.65 30.3333L30 35.9833L24.35 30.3333C23.5125 29.4994 22.8715 28.4892 22.4737 27.3763C22.0758 26.2635 21.9311 25.0759 22.05 23.9ZM41.6667 43.3333H18.3333C17.8913 43.3333 17.4674 43.5089 17.1548 43.8215C16.8423 44.134 16.6667 44.558 16.6667 45C16.6667 45.442 16.8423 45.866 17.1548 46.1785C17.4674 46.4911 17.8913 46.6667 18.3333 46.6667H41.6667C42.1087 46.6667 42.5326 46.4911 42.8452 46.1785C43.1577 45.866 43.3333 45.442 43.3333 45C43.3333 44.558 43.1577 44.134 42.8452 43.8215C42.5326 43.5089 42.1087 43.3333 41.6667 43.3333Z" fill="#FFA000"></path>
</svg></span>
                                <span class="d-inline-block icon-arrow-right"></span>
                                                                <span class="avicon">
<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="30" cy="30" r="30" fill="#FAE8CA"></circle>
<path d="M45.0067 23.2917V20C45.0067 16.3233 42.0167 13.3333 38.34 13.3333H21.6733C17.9967 13.3333 15.0067 16.3233 15.0067 20V23.33L14.88 23.3367C14.4597 23.367 14.0664 23.5555 13.7795 23.8641C13.4925 24.1727 13.3331 24.5786 13.3333 25V28.3333C13.3333 28.7754 13.5089 29.1993 13.8215 29.5118C14.134 29.8244 14.558 30 15 30H15.0067V40C15.0067 41.225 15.6783 42.2867 16.6667 42.8667V45C16.6667 45.442 16.8423 45.866 17.1548 46.1785C17.4674 46.4911 17.8913 46.6667 18.3333 46.6667H20C20.442 46.6667 20.8659 46.4911 21.1785 46.1785C21.4911 45.866 21.6667 45.442 21.6667 45V43.3333H38.3333V45C38.3333 45.442 38.5089 45.866 38.8215 46.1785C39.134 46.4911 39.558 46.6667 40 46.6667H41.6667C42.1087 46.6667 42.5326 46.4911 42.8452 46.1785C43.1577 45.866 43.3333 45.442 43.3333 45V42.8733C43.84 42.5835 44.2614 42.1654 44.5552 41.661C44.8489 41.1566 45.0046 40.5837 45.0067 40V30C45.4487 30 45.8726 29.8244 46.1852 29.5118C46.4977 29.1993 46.6733 28.7754 46.6733 28.3333V25.1033C46.6925 24.8447 46.6514 24.5851 46.5533 24.345C46.215 23.5333 45.495 23.3383 45.0067 23.2917ZM41.6767 40H18.34V31.6667H41.675L41.6767 40ZM28.34 21.6667V28.3333H18.34V21.6667H28.34ZM41.6733 21.6667V28.3333H31.6733V21.6667H41.6733ZM21.6733 16.6667H38.34C39.5667 16.6667 40.6317 17.3417 41.21 18.3333H18.8033C19.3817 17.3417 20.4467 16.6667 21.6733 16.6667Z" fill="#FFA000"></path>
<path d="M22.5 38.3333C23.8807 38.3333 25 37.214 25 35.8333C25 34.4526 23.8807 33.3333 22.5 33.3333C21.1193 33.3333 20 34.4526 20 35.8333C20 37.214 21.1193 38.3333 22.5 38.3333Z" fill="#FFA000"></path>
<path d="M37.5 38.3333C38.8807 38.3333 40 37.214 40 35.8333C40 34.4526 38.8807 33.3333 37.5 33.3333C36.1193 33.3333 35 34.4526 35 35.8333C35 37.214 36.1193 38.3333 37.5 38.3333Z" fill="#FFA000"></path>
</svg>
</span>
                            <span class="d-inline-block icon-arrow-right"></span>
                                <span class="avicon">
<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="30" cy="30" r="30" fill="#FAE8CA"></circle>
<path d="M43.3333 16.6667H16.6667C14.8283 16.6667 13.3333 18.1617 13.3333 20V40C13.3333 41.8383 14.8283 43.3333 16.6667 43.3333H43.3333C45.1717 43.3333 46.6667 41.8383 46.6667 40V20C46.6667 18.1617 45.1717 16.6667 43.3333 16.6667ZM16.6667 20H43.3333V23.3333H16.6667V20ZM16.6667 40V30H43.335L43.3367 40H16.6667Z" fill="#FFA000"></path>
<path d="M20 33.3333H30V36.6667H20V33.3333Z" fill="#FFA000"></path>
</svg></span>
                                <span class="d-inline-block icon-arrow-right"></span>
                                <span class="avicon"><svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="30" cy="30" r="30" fill="#FAE8CA"></circle>
<path d="M25 26.6667C24.558 26.6667 24.1341 26.8423 23.8215 27.1548C23.5089 27.4674 23.3333 27.8913 23.3333 28.3333V31.6667C23.3333 32.1087 23.5089 32.5326 23.8215 32.8452C24.1341 33.1577 24.558 33.3333 25 33.3333C25.442 33.3333 25.866 33.1577 26.1785 32.8452C26.4911 32.5326 26.6667 32.1087 26.6667 31.6667V28.3333C26.6667 27.8913 26.4911 27.4674 26.1785 27.1548C25.866 26.8423 25.442 26.6667 25 26.6667ZM45 28.3333C45.442 28.3333 45.866 28.1577 46.1785 27.8452C46.4911 27.5326 46.6667 27.1087 46.6667 26.6667V20C46.6667 19.558 46.4911 19.1341 46.1785 18.8215C45.866 18.5089 45.442 18.3333 45 18.3333H15C14.558 18.3333 14.1341 18.5089 13.8215 18.8215C13.5089 19.1341 13.3333 19.558 13.3333 20V26.6667C13.3333 27.1087 13.5089 27.5326 13.8215 27.8452C14.1341 28.1577 14.558 28.3333 15 28.3333C15.442 28.3333 15.866 28.5089 16.1785 28.8215C16.4911 29.1341 16.6667 29.558 16.6667 30C16.6667 30.442 16.4911 30.866 16.1785 31.1785C15.866 31.4911 15.442 31.6667 15 31.6667C14.558 31.6667 14.1341 31.8423 13.8215 32.1548C13.5089 32.4674 13.3333 32.8913 13.3333 33.3333V40C13.3333 40.442 13.5089 40.866 13.8215 41.1785C14.1341 41.4911 14.558 41.6667 15 41.6667H45C45.442 41.6667 45.866 41.4911 46.1785 41.1785C46.4911 40.866 46.6667 40.442 46.6667 40V33.3333C46.6667 32.8913 46.4911 32.4674 46.1785 32.1548C45.866 31.8423 45.442 31.6667 45 31.6667C44.558 31.6667 44.1341 31.4911 43.8215 31.1785C43.5089 30.866 43.3333 30.442 43.3333 30C43.3333 29.558 43.5089 29.1341 43.8215 28.8215C44.1341 28.5089 44.558 28.3333 45 28.3333ZM43.3333 25.3C42.3681 25.6503 41.5341 26.2894 40.9447 27.1303C40.3554 27.9712 40.0392 28.9731 40.0392 30C40.0392 31.0269 40.3554 32.0288 40.9447 32.8697C41.5341 33.7106 42.3681 34.3497 43.3333 34.7V38.3333H26.6667C26.6667 37.8913 26.4911 37.4674 26.1785 37.1548C25.866 36.8423 25.442 36.6667 25 36.6667C24.558 36.6667 24.1341 36.8423 23.8215 37.1548C23.5089 37.4674 23.3333 37.8913 23.3333 38.3333H16.6667V34.7C17.6319 34.3497 18.4659 33.7106 19.0553 32.8697C19.6446 32.0288 19.9608 31.0269 19.9608 30C19.9608 28.9731 19.6446 27.9712 19.0553 27.1303C18.4659 26.2894 17.6319 25.6503 16.6667 25.3V21.6667H23.3333C23.3333 22.1087 23.5089 22.5326 23.8215 22.8452C24.1341 23.1577 24.558 23.3333 25 23.3333C25.442 23.3333 25.866 23.1577 26.1785 22.8452C26.4911 22.5326 26.6667 22.1087 26.6667 21.6667H43.3333V25.3Z" fill="#FFA000"></path>
</svg></span>
                            </div>
                            <p>Chọn chuyến, chỗ ngồi phù hợp và điền thông tin</p>
                        </div>
                    </div>
                </div>
                            </div>
            <div class="col-xs-12 col-sm-12 col-md-1 col-lg-1"></div>
        </div>
    </div>
 </section>`;

    var searchTicketDestop = new SearchTicket({
        wrap: '#js-SearchTicket',
        pointUpSelector: ".pointUp",
        pointDownSelector: ".pointDown",
        dateSelector: ".ticket-date",
        triggleSearchTicket: "[data-action=searchTrip]",
        textPointUpSelector: "[data-point-target=pointUp]",
        textPointDownSelector: "[data-point-target=pointDown]",
        target: '_BLANK',

        pointUpData: function(){},
        pointDownData: function(){},
        dateData: function(){},
        numberSeatData: function() {},
        timeData: function(){},
        listPointById: function(){
            return listPointById
        },
        doWhenChoseTime: function(data){}
    });
}

// Hàm init để khởi chạy plugin
function init(companyId) {
  loadScriptsAndStyles(companyId, initializePlugin);
}

// Export hàm init
window.customPluginInit = init;
