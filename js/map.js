Vue.component('admire-block', {
    props   : ['data'],
    template: `<div class style="width: 100%; height: 60px; overflow: hidden;">
        <img :src="'https://admire.social/' + data.avatar" style="height: 60px; width: 60px;">
        <p class="d-inline">{{data.title}}</p>
    </div>`
})

Vue.component('user-block', {
    props   : ['data'],
    template: `<div class style="width: 100%; height: 60px; overflow: hidden;">
        <img :src="data.avatar" style="height: 60px; width: 60px;">
        <p class="d-inline">{{data.text}}</p>
    </div>`
})

var platform = new H.service.Platform({
    app_id  : 'UdRH6PlISTlADYsW6mzl',
    app_code: 'lfrrTheP9nBedeJyy1NtIA',
    useHTTPS: true
});

var pixelRatio    = window.devicePixelRatio || 1;
var defaultLayers = platform.createDefaultLayers({
    lg      : 'rus',
    tileSize: pixelRatio === 1 ? 256      : 512,
    ppi     : pixelRatio === 1 ? undefined: 320
});

var map = new H.Map(
    document.getElementById('map'),
    defaultLayers.normal.map,
    {
      zoom  : 8,
      center: { lat: 44.73, lng: 37.76 }
    }, 
    {
        pixelRatio: pixelRatio
    });
    
var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

var ui = H.ui.UI.createDefault(map, defaultLayers, 'ru-RU');

var mapSettings = ui.getControl('mapsettings');
var zoom        = ui.getControl('zoom');
var scalebar    = ui.getControl('scalebar');
var pano        = ui.getControl('panorama');

mapSettings.setAlignment('bottom-center');
zoom.setAlignment('bottom-center');
scalebar.setAlignment('bottom-center');
pano.setAlignment('bottom-center');

platform.configure(H.map.render.panorama.RenderEngine);

$.ajax({
    url    : "php/get-wall.php",
    type   : "GET",
    success: function(data) {
        console.log(JSON.parse(data));
    }
});

let G = {
    'StartTrackPosition': {},   // Функция отслеживания местоположения
    'ShowPosition'      : {},   // Функция отображения местоположения пользователя на карте
    'ShowError'         : {},   // Обработчик ошибки - например пользователь не дал доступ к трекингу геолокации 
    'CurrentPosition'   : {},   // Координаты текущего местоположения
    'LocationMarker'    : {},   // Маркер с текущим местоположением
}

G.StartTrackPosition = () => {
    // Проверка поддержки браузером Geolocation API
    if (navigator.geolocation) {
        // Начать трекинг местоположения
        navigator.geolocation.watchPosition(G.ShowPosition, G.ShowError)
    } else {
    }
}

G.ShowPosition = position => {
    // Сохранение координат текущего местоположения
    G.CurrentPosition = { 
        lat: position.coords.latitude,
        lng: position.coords.longitude
    }
    
    // Если объект маркера уже существует, обновляем значение координат на текущее
    if (G.LocationMarker instanceof H.map.Marker) {
        G.LocationMarker.setPosition(G.CurrentPosition);
    } else if(G.CurrentPosition != {}) {
        let marker;
        if(!!localStorage.getItem('id') && +localStorage.getItem('id') < 100) {
            let avatar;
            for(let i in all_users_data) {
                if(+all_users_data[i].id == +localStorage.getItem('id')) {
                    avatar = all_users_data[i].avatar;
                }
            }
            let icon = new H.map.DomIcon(`<div class="place-icon-block">
                <div class="place-icon-arrow"></div>
                <div style="background: url(https://admire.social/avatars/${avatar}) no-repeat center / cover;" class="circle responsive-img place-icon"></div>
            </div>`);
            marker = new H.map.DomMarker(G.CurrentPosition, {icon: icon});
        } else {
            let icon = new H.map.DomIcon(`<div class="place-icon-block">
                <div class="place-icon-arrow"></div>
                <div style="background: url(images/I.png) no-repeat center / cover;" class="circle responsive-img place-icon"></div>
            </div>`);
            marker = new H.map.DomMarker(G.CurrentPosition, {icon: icon});
        }
        G.LocationMarker = marker;
        map.addObject(G.LocationMarker);
    }       
}

// Обработка ошибок
G.ShowError = error =>{
    switch(error.code) {
        case error.PERMISSION_DENIED: 
          break
        case error.POSITION_UNAVAILABLE: 
          break
        case error.TIMEOUT: 
          break
        case error.UNKNOWN_ERROR: 
          break
    }
}

// Запуск трекинга местоположения
G.StartTrackPosition()

var set_meating = [];

map.addEventListener('tap', function (evt) {
    console.log(evt);
    let coord = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
    if(AdmireApp.is_route) {
            AdmireApp.is_route = false;
        calculateRouteFromAtoB([coord.lat, coord.lng]);
    } else if(AdmireApp.is_meating) {
        set_meating          = [coord.lat, coord.lng];
        AdmireApp.is_meating = false;
        alert('Встреча предложена');
    }
});

var searched_group   = new H.map.Group();
var users_group      = new H.map.Group();
var demo_place_group = new H.map.Group();
var place_group      = new H.map.Group();
var admire_group     = new H.map.Group();
var posts_group      = new H.map.Group();
map.addObject(searched_group);
map.addObject(users_group);
map.addObject(demo_place_group);
map.addObject(place_group);
map.addObject(admire_group);
map.addObject(posts_group);

admire_group.addEventListener('tap', function (evt) {
    to_point = AdmireApp.places[+evt.target.label].route[0];
    
    OpenRC(evt);
    $('#connect-add').css('display', 'none');
});

var friend_id;
users_group.addEventListener('tap', function (evt) {
    to_point  = evt.target.coords;
    friend_id = evt.target.user_id;
    $('#connect-add').css('display', 'inline-block');
    
    OpenRC(evt);
});

let to_point;

const OpenRC = (evt) => {
    console.log(evt);

    $('#menu-add').css('top', (evt.currentPointer.viewportY - 50) + 'px');
    $('#menu-add').css('left', evt.currentPointer.viewportX + 'px');
    $('#menu-add').css('display', 'block');
}

function addDemoPointToMap(place, index) {
    let position;
    let icon     = new H.map.DomIcon(`<div index="${index}" data-place='${JSON.stringify(place)}' class="demo-place"></div>`);
        position = {
        lat: place.route[0][0],
        lng: place.route[0][1]
    };
    let marker       = new H.map.DomMarker(position, {icon: icon});
        marker.label = index;
    demo_place_group.addObject(marker);
}

function addPlaceToMap(place, index) {
    let position;
    let icon = new H.map.DomIcon(`<div class="place-icon-block">
        <div class="place-icon-arrow"></div>
        <div style="background: url(https://admire.social/avatars/${place.avatar}) no-repeat center / cover;
            color      : white;
            text-align : center;
            line-height: 50px;
            font-size  : 28px;" class="circle responsive-img place-icon">A</div>
    </div>`);
    position = {
        lat: place.route[0][0],
        lng: place.route[0][1]
    };

    let min = 0;
    if(place.rating <= 400000) {
        min = 16;
    } else if(place.rating <= 600000) {
        min = 14;
    } else if(place.rating <= 800000) {
        min = 10;
    }
    let marker       = new H.map.DomMarker(position, {icon: icon,
        min: min,
        max: 20
    });
    marker.label = index;
    admire_group.addObject(marker);

    if(place.route.length > 1) {
        var lineString = new H.geo.LineString();

        for(let i in place.route) {
            lineString.pushPoint({lat: place.route[i][0], lng: place.route[i][1]});
        }

        admire_group.addObject(new H.map.Polyline(
            lineString, { style: { lineWidth: 4 }}
        ));
    }
    
    /*map.setViewBounds(place_group.getBounds());
    map.setZoom(Math.min(map.getZoom(), 20));*/
}

function addGroupPlaceToMap(count, coord) {
    let position;
    let icon = new H.map.DomIcon(`<div class="place-icon-block">
        <div class="place-icon-arrow"></div>
        <div style="background: #333;
        color      : white;
        text-align : center;
        line-height: 50px;
        font-size  : 28px;" class="circle responsive-img place-icon">${count}</div>
    </div>`);
    position = {
        lat: +coord[0] / count,
        lng: +coord[1] / count
    };
    console.log(position);
    let marker       = new H.map.DomMarker(position, {icon: icon});
        marker.label = "group";
        
    admire_group.addObject(marker);
}

let C = {
    // Перевод шагов в метры
    CvtStepsToMeters: steps => steps * 0.762,
    // Перевод метров в шаги
    CvtMetersToSteps: meters => meters / 0.762,
    // Функция для создания маркеров
    CreateMarker: (coords, options=null) => new H.map.Marker({ lat: coords.lat, lng: coords.lng }, options),
}

let onResult = result => {
    searched_group.removeObjects(searched_group.getObjects());
    
    let startPoint = C.CreateMarker({ lat: '34', lng: '64' }, {});
    
    result.results.items.forEach( point => {
        
        let endPoint = C.CreateMarker({ lat: point.position[0], lng: point.position[1]}, {icon: new H.map.Icon(point.icon)});
        
        let distance = startPoint.getPosition().distance(endPoint.getPosition());
        
        endPoint.setData({ 'distance': C.CvtMetersToSteps(distance), 'name': point.title}).addEventListener('tap', e => {
            let coord    = map.screenToGeo(e.currentPointer.viewportX, e.currentPointer.viewportY);
                to_point = [coord.lat, coord.lng];
            
            $('#connect-add').css('display', 'none');
            OpenRC(e);

            M.toast({html: e.target.getData().name});
        })

        searched_group.addObject(endPoint);
    }) 
}

let bubble_route;
function openSearchBubble(position, text){
    if(!bubble_route){
        bubble_route =  new H.ui.InfoBubble(
        position,
        {content: text});
        ui.addBubble(bubble_route);
    } else {
        bubble_route.setPosition(position);
        bubble_route.setContent(text);
        bubble_route.open();
    }
}

let onError = error => console.log(error)

if(!localStorage.getItem('id')) {
    localStorage.setItem('id', ((new Date()).getTime() + "" + Math.round(Math.random() * (9999 - 1000) + 1000)).substring(6));
}

var all_users_data = [];
$.ajax({
    url    : "https://admire.social/back/get-all-users.php",
    type   : "GET",
    success: function(data) {
        all_users_data = JSON.parse(data);
    }
});

let update_timeout, all_demo_place;

var windowPosition = {
    top   : 0,
    left  : 0,
    right : document.documentElement.clientWidth,
    bottom: document.documentElement.clientHeight
};
                   
$.ajax({
    url    : 'php/all_posts_data.json',
    type   : "GET",
    success: function(data) {
        AdmireApp.posts_data = JSON.parse(data);
    }
});

function calculateRouteFromAtoB (from_point) {
    var router             = platform.getRoutingService(),
        routeRequestParams = {
            mode              : `balanced;car`,
            representation    : 'display',
            waypoint0         : `${from_point[0]},${from_point[1]}`,
            waypoint1         : `${to_point[0]},${to_point[1]}`,
            routeattributes   : 'waypoints,summary,shape,legs',
            maneuverattributes: 'direction,action'
        };
  
  
    router.calculateRoute(
        routeRequestParams,
        onRouteSuccess,
        onRouteError
    );
}

let polyline_route;

function addRouteShapeToMap(route){
    var lineString = new H.geo.LineString(),
        routeShape = route.shape;
  
    routeShape.forEach(function(point) {
        var parts = point.split(',');
        lineString.pushLatLngAlt(parts[0], parts[1]);
    });
    if (!!polyline_route) {
        map.removeObject(polyline_route);

        polyline_route = null;
    }
    polyline_route = new H.map.Polyline(lineString, {
        style: {
            lineWidth  : 4,
            strokeColor: 'rgba(255, 255, 0, 0.7)'
        }
    });
    map.addObject(polyline_route);
    map.setViewBounds(polyline_route.getBounds(), true);
}

let group;

function addManueversToMap(route){
    var svgMarkup = '<svg width="18" height="18" ' +
        'xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="8" cy="8" r="8" ' +
            'fill="#666666" stroke="white" stroke-width="1"  />' +
        '</svg>',
        dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}}),
        i,
        j;

    if(!!group) {
        map.removeObject(group);

        group = null;
    }

    group = new H.map.Group()
  
    for (i = 0;  i < route.leg.length; i += 1) {
        for (j = 0;  j < route.leg[i].maneuver.length; j += 1) {
            
            maneuver = route.leg[i].maneuver[j];
            
            var marker =  new H.map.Marker({
            lat: maneuver.position.latitude,
            lng: maneuver.position.longitude},
            {icon: dotIcon});
            marker.instruction = maneuver.instruction;
            group.addObject(marker);
        }
    }
  
    group.addEventListener('tap', function (evt) {
        map.setCenter(evt.target.getPosition());
        openSearchBubble(
            evt.target.getPosition(), evt.target.instruction);
    }, false);
  
    map.addObject(group);
}

function onRouteSuccess(result) {
    if(!!result.response) {
        var route = result.response.route[0];
    } else {
        alert("Выбранным способом передвижения маршрут не найден :(");
    }

    addRouteShapeToMap(route);
    addManueversToMap(route);
}

var fuck_hach = false;
  
function onRouteError(error) {
    alert('Ooops!');
}

var AdmireApp = new Vue({
    el  : "#AdmireApp",
    data: {
        places              : [],
        posts               : false,
        admire              : false,
        eat_drink           : false,
        going_out           : false,
        museums             : false,
        leisure_outdoor     : false,
        natural_geographical: false,

        weather: {},

        posts_data: [],

        is_meating: false,
        is_route  : false
    },
    created() {
        $.ajax({
            url    : "https://admire.social/back/get-places.php",
            type   : "GET",
            success: function(data) {
                AdmireApp.places = JSON.parse(data);
                for (let i in AdmireApp.places) {
                    AdmireApp.places[i].images       = JSON.parse(AdmireApp.places[i].images);
                    AdmireApp.places[i].tags         = JSON.parse(AdmireApp.places[i].tags.replace(new RegExp('u0','g'),'\\u0'));
                    AdmireApp.places[i].count_rating = JSON.parse(AdmireApp.places[i].count_rating);
                    AdmireApp.places[i].route        = JSON.parse(AdmireApp.places[i].route);
                    AdmireApp.places[i].social       = JSON.parse(AdmireApp.places[i].social);
                    addDemoPointToMap(AdmireApp.places[i], i);
                }

                all_demo_place = document.getElementsByClassName("demo-place");
            }
        });


        let meating;

        map.addEventListener('mapviewchange', function() {
            $('#menu-add').css('display', 'none');
            $('#connect-add').css('display', 'none');

            clearTimeout(update_timeout);
            update_timeout = setTimeout(AdmireApp.UpdataMap, 35);
        });

        setInterval(function() {
            $.ajax({
                url : "php/updata-position.php",
                type: "POST",
                data: {
                    id      : localStorage.getItem('id'),
                    position: [
                        G.CurrentPosition.lat,
                        G.CurrentPosition.lng
                    ],
                    set_meating: set_meating
                },
                success: function(data) {
                    let all_users   = JSON.parse(data);
                        set_meating = [];

                    users_group.removeObjects(users_group.getObjects());

                    for(let user of all_users) {
                        if(user.id != localStorage.getItem('id') && !!user.position) {
                            var user_marker;
                            if(+user.id < 100) {
                                let avatar;
                                for(let i in all_users_data) {
                                    if(+all_users_data[i].id == +user.id) {
                                        avatar = all_users_data[i].avatar;
                                    }
                                }
                                let icon = new H.map.DomIcon(`<div class="place-icon-block">
                                    <div class="place-icon-arrow"></div>
                                    <div style="background: url(https://admire.social/avatars/${avatar}) no-repeat center / cover;" class="circle responsive-img place-icon"></div>
                                </div>`);
                                position = {
                                    lat: user.position[0],
                                    lng: user.position[1]
                                };
                                user_marker = new H.map.DomMarker(position, {icon: icon});
                            } else {
                                var svgMarkup = '<svg width="18" height="18" ' +
                                    'xmlns="http://www.w3.org/2000/svg">' +
                                    '<circle cx="8" cy="8" r="8" ' +
                                        'fill="#ffff66" stroke="white" stroke-width="1"  />' +
                                    '</svg>';
                                    
                                dotIcon = new H.map.Icon(svgMarkup, {anchor: {x: 8, y: 8}});
                                
                                user_marker = new H.map.Marker({
                                    lat: user.position[0],
                                    lng: user.position[1]
                                }, {icon: dotIcon});
                            }

                            if(!!user.set_meating && !fuck_hach) {
                                if(meating != [user.set_meating[0], user.set_meating[1]]) {
                                    alert("Вам предложена встреча");
                                    map.setCenter({
                                        lat: user.set_meating[0],
                                        lng: user.set_meating[1]
                                    });

                                    // Простите, но на этом моменте мы заебались :((((
                                    fuck_hach = true;
                                    
                                    let icon_meating = new H.map.DomIcon(`<div class="place-icon-block">
                                        <div class="place-icon-arrow"></div>
                                        <div style="background: url(https://psv4.userapi.com/c848236/u215785375/docs/d15/4cae0136dbcd/pozhiloy_chuvak2.png?extra=R-hmnU0eacAYUCc-xPCuYYtFo00d2OJtEenTOyaSLNColQQgqozbMQH1HwKcesWFpOE3SJcPbLiPqAnjbW-C1yZ0OJZpdj2no0jdjsrQ9Ss_LlYjOGdsT17E-S-3meqQRDtPYCjf1vslijczZ_ZTkhK-1Q) no-repeat center / cover;" class="circle responsive-img place-icon"></div>
                                    </div>`);
                                    meating_marker = new H.map.DomMarker({
                                        lat: user.set_meating[0],
                                        lng: user.set_meating[1]
                                    }, {icon: icon_meating});

                                    meating = [user.set_meating[0], user.set_meating[1]];

                                    users_group.addObject(meating_marker);
                                }
                            }

                            user_marker.coords  = [user.position[0], user.position[1]];
                            user_marker.user_id = user.id;
                            users_group.addObject(user_marker);
                        }
                    }
                }
            });
        }, 5000);
    },
    methods: {
        UpdataMap: function() {
            let cat                              = "";
            if  (this.eat_drink) cat            += ",eat-drink";
            if  (this.going_out) cat            += ",going-out";
            if  (this.museums) cat              += ",museums";
            if  (this.leisure_outdoor) cat      += ",leisure-outdoor";
            if  (this.natural_geographical) cat += ",natural-geographical";

            if(!!cat) {
                cat = cat.substring(1);
                
                let explore = {
                    'in' : `${map.getCenter().lat},${map.getCenter().lng};r=20000`,
                    'cat': cat
                }

                platform.getPlacesService().explore(
                    explore,                    
                    result => onResult(result),
                    error  => onError(error)
                );
            } else {
                searched_group.removeObjects(searched_group.getObjects());
            }

            if(this.admire) {
                admire_group.removeAll();

                let prepear_place_data = [];
                
                for(let pl of all_demo_place) {
                    let targetPosition = {
                        top : window.pageYOffset + pl.getBoundingClientRect().top,
                        left: window.pageXOffset + pl.getBoundingClientRect().left
                    }

                    if (targetPosition.top > windowPosition.top - 30 &&
                        targetPosition.top < windowPosition.bottom + 30 &&
                        targetPosition.left > windowPosition.left - 30 &&
                        targetPosition.left < windowPosition.right + 30) {

                        let find = false;
                        for(let i in prepear_place_data) {
                            if((Math.pow(prepear_place_data[i].pos[0] - targetPosition.left, 2) + 
                                Math.pow(prepear_place_data[i].pos[1] - targetPosition.top, 2)) < 400 && !find) {

                                prepear_place_data[i].count++;
                                prepear_place_data[i].pos   [0] = (+prepear_place_data[i].pos[0] + +targetPosition.left) / 2;
                                prepear_place_data[i].pos   [1] = (+prepear_place_data[i].pos[1] + +targetPosition.top) / 2;
                                prepear_place_data[i].coord[0]  = +prepear_place_data[i].coord[0] + +JSON.parse(pl.getAttribute("data-place")).route[0][0];
                                prepear_place_data[i].coord[1]  = +prepear_place_data[i].coord[1] + +JSON.parse(pl.getAttribute("data-place")).route[0][1];
                                                   find         = true;
                            }
                        }
                        if(!find) {
                            let data = JSON.parse(pl.getAttribute("data-place"));
                            prepear_place_data.push({
                                data : data,
                                index: pl.getAttribute("index"),
                                count: 1,
                                pos  : [
                                    targetPosition.left,
                                    targetPosition.top
                                ],
                                coord: data.route[0]
                            });
                        }
                    }
                }

                for(let pl of prepear_place_data) {
                    if(pl.count == 1) {
                        addPlaceToMap(pl.data, pl.index);
                    } else {
                        addGroupPlaceToMap(pl.count, pl.coord);
                    }
                }
            } else {
                admire_group.removeAll();
            }

            if(this.posts) {
                for(let us in this.posts_data) {
                    for(let pi in this.posts_data[us].data) {
                        let p    = this.posts_data[us].data[pi];
                        let icon = new H.map.DomIcon(`<div class="place-icon-block">
                            <div class="place-icon-arrow"></div>
                            <div style="background: url(${p.data.attachments[0].photo.photo_130}) no-repeat center / cover;" class="responsive-img place-icon"></div>
                        </div>`);
                        let position = {
                            lat: p.coords[0],
                            lng: p.coords[1]
                        };
                        let user_marker = new H.map.DomMarker(position, {icon: icon});
                        posts_group.addObject(user_marker);
                    }
                }
            } else {
                posts_group.removeAll();
            }

            if(!this.eat_drink && 
                !this.going_out && 
                !this.museums && 
                !this.leisure_outdoor && 
                !this.natural_geographical && 
                !this.admire && 
                !this.posts)

            $.ajax({
                url : "/php/get-weather.php",
                type: "POST",
                data: {
                    url: `https://weather.api.here.com/weather/1.0/report.json?app_id=UdRH6PlISTlADYsW6mzl&app_code=lfrrTheP9nBedeJyy1NtIA&product=forecast_7days_simple&latitude=${map.getCenter().lat}&longitude=${map.getCenter().lng}&language=russian`
                },
                success: function(data) {
                    AdmireApp.weather = JSON.parse(data);
                }
            });
        },
        OpenSidenav: function(bool) {
            if(bool) 
                $('.sidenav').css('transform', 'translateX(0)');
            else 
                $('.sidenav').css('transform', 'translateX(-105%)');
        },
        CreateRoute: function() {
            if(Object.keys(G.CurrentPosition).length != 0) {
                calculateRouteFromAtoB([
                    G.CurrentPosition.lat,
                    G.CurrentPosition.lng
                ]);
            } else {
                this.is_route = true;
            }
        },
        CreateMeating: function() {
            this.is_meating = true;
        }
    }
});