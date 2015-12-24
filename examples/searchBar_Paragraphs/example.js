require(['../config'], function(config) {
    require(['jquery', 'c4/APIconnector', 'c4/paragraphDetection', 'c4/searchBar/searchBar', 'c4/iframes','c4/examples/loggingExample/md5'], function($, api, paragraphDetection, searchBar, iframes,md5) {
        
        window.top.postMessage({event: 'searchBarOpened',data:""},'*');
       
        var baseUrl = undefined;
        var origin = {};
       
        window.addEventListener('message', function (msg) {
            if (msg.data.event && msg.data.event === 'eexcess.currentResults') {
                //window.console.log('eexcess.currentResults', msg.data.data);
                iframes.sendMsgAll({
                    event: 'eexcess.newResults',
                    data: api.getCurrent()
                });
            } else if(msg.data.event && msg.data.event === 'apiSettings'){
                origin = msg.data.data.origin;
                baseUrl = msg.data.data.baseUrl;
                api.init({
                    origin: origin,
                    base_url: baseUrl
                });
            }
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
                deferLoading: true,
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
                url: "https://rawgit.com/megamuf/visualization-widgets-for-moodle-plugin/master/FacetScape/index.html",
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

