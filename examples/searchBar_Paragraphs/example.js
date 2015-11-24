require(['../config'], function(config) {
    require(['jquery', 'c4/APIconnector', 'c4/paragraphDetection', 'c4/searchBar/searchBar', 'c4/iframes','c4/examples/loggingExample/md5'], function($, api, paragraphDetection, searchBar, iframes,md5) {
         function createUserID(clientType, userName) {
        return md5.getHash(clientType + userName);
    }
        var origin = {
                clientType: "EEXCESS - Moodle Plugin",
                clientVersion: "1.0",
                userID: "undefined",
                module: "eexcess"
            };
            var userId = undefined;
            origin.userID = createUserID(origin.clientType, userId);
            
        window.addEventListener('message', function (msg) {
            if (msg.data.event && msg.data.event === 'eexcess.currentResults') {
                window.console.log('eexcess.currentResults', msg.data.data);
                //window.parent.postMessage({event: 'eexcess.newResults',data: api.getCurrent()},'*');
                iframes.sendMsgAll({
                    event: 'eexcess.newResults',
                    data: api.getCurrent()
                });
            }/*else if (msg.data.event && msg.data.event === 'eexcess.queryTriggered'){
                var profile = msg.data.data;
                window.console.log('profile',profile);
            }*/
        });
        // set origin in the APIconnector
         /*window.addEventListener('message', function (e) {
            if(e.data.event && e.data.event === 'eexcess.newResults'){
                iframes.sendMsgAll({
                    event: 'eexcess.newResults',
                    data: e.data.data
                });
            }
        });*/
        api.init({
            origin: origin
        });

        // add searchResultListVis widget to display results
        var tabs = [{
                name: "search results",
                // here we use the widget from Github directly for demonstration purposes. You should avoid this and instead clone the visualization-widgets repository into your project or add it as submodule.
                url: "https://rawgit.com/megamuf/visualization-widgets-for-moodle-plugin/master/SearchResultListVis/index.html",
                icon: "http://rawgit.com/EEXCESS/visualization-widgets/master/SearchResultListVis/icon.png"
            },
            {
                name: "dashboard",
                // here we use the widget from Github directly for demonstration purposes. You should avoid this and instead clone the visualization-widgets repository into your project or add it as submodule.
                url: "https://eexcess.github.io/visualization-widgets-files/Dashboard/index.html",
                icon: "http://rawgit.com/EEXCESS/visualization-widgets/master/Dashboard/icon.png",
                deferLoading: true
            },
//    {
//            name:"power search",
//            // here we use the widget from Github directly for demonstration purposes. You should avoid this and instead clone the visualization-widgets repository into your project or add it as submodule.
//            url:"http://rawgit.com/EEXCESS/visualization-widgets/master/PowerSearch/index.html",
//            icon:"http://rawgit.com/EEXCESS/visualization-widgets/master/PowerSearch/icon.png"
//    },
            {
                name: "facet scape",
                // here we use the widget from Github directly for demonstration purposes. You should avoid this and instead clone the visualization-widgets repository into your project or add it as submodule.
                url: "http://rawgit.com/EEXCESS/visualization-widgets/master/FacetScape/index.html",
                icon: "http://rawgit.com/EEXCESS/visualization-widgets/master/FacetScape/icon.png",
                deferLoading: true
            }];
        // initialize the searchBar with the specified tabs and the path to the image folder
        searchBar.init(tabs, {imgPATH: '../../searchBar/img/', queryCrumbs: {active: true}, origin:origin});
        // detect paragraphs
        var paragraphs = paragraphDetection.getParagraphs();
        // draw silver border around detected paragraphs
        $('.eexcess_detected_par').css('border', '1px dotted silver');

        // listen for paragraph focused events
        var focusedParagraph;
        $(document).on('paragraphFocused', function(e) {
            if (focusedParagraph !== e.originalEvent.detail.paragraph) {
                var eventDetail = e.originalEvent.detail;
                focusedParagraph = eventDetail.paragraph;
                // reset background color on all detected paragraphs
                $.each(paragraphs, function() {
                    $(this.elements[0]).parent().css('background-color', 'white');
                });
                // color background on focused paragraph
                $(eventDetail.paragraph.elements[0]).parent().css('background-color', 'cyan');
                // generate query from focused paragraph and set it in the search bar
                paragraphDetection.paragraphToQuery(eventDetail.paragraph.content, function(paragraphStatistics) {
                    // set query in search bar
                    if (eventDetail.trigger && eventDetail.trigger === 'click') {
                        searchBar.setQuery(paragraphStatistics.query.contextKeywords, true);
                    } else {
                        searchBar.setQuery(paragraphStatistics.query.contextKeywords);
                    }
                });
            }
        });
        // start detection of focused paragraphs
        paragraphDetection.findFocusedParagraphSimple();
    });
});