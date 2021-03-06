'use strict';

var log = hexo.log || log.log;

hexo.extend.filter.register('before_post_render', function(postInfo) {
    var config = hexo.config.post_series;
    var posts = hexo.locals.get('posts');

    var postsInSameSeries = posts.data.reduce(function(result, post) {
        if (post.series && post.series === postInfo.series) {
            result.push({
                'id' : post.id,
                'title' : post.title,
                'path' : post.path,
                'permalink' : post.permalink,
                'date' : post.date
            });
        }
        return result;
    }, []);

    postsInSameSeries.sort(function(left, right) {
        if (config.reverse_sort) {
            return left.date < right.date;
        }
        return left.date > right.date;
    });

    postInfo.postsInSameSeries = postsInSameSeries;

    // console.log(postInfo.postsInSameSeries);
    if (postInfo.postsInSameSeries.size > 0) {
        log.log("Post series updated: " + postInfo.path);
    }
});

hexo.extend.tag.register('posts_in_same_series', function (args) {
    var postInfo = this;

    if (postInfo.postsInSameSeries.size === 0) {
        return '';
    }

    var config = hexo.config.post_series;

    var postSeriesHtmlSegments = ['<div class="post-series">'];
    if (config.list_title) {
        postSeriesHtmlSegments = postSeriesHtmlSegments.concat([ '<div class="post-series-title">', config.list_title, '</div>' ]);
    }
    postSeriesHtmlSegments.push('<ul class="post-series-list">');

    postInfo.postsInSameSeries.reduce(function(result, post) {
        result.push('<li class="post-series-list-item"><a href="');
        result.push(isRunningInLocalServerMode() ? '/' + post.path : post.permalink);
        result.push(config.open_in_new_tab ? '" target="_blank">' : '">');
        result.push(post.title);
        result.push('</a></li>');
        return result;
    }, postSeriesHtmlSegments);

    postSeriesHtmlSegments.push('</ul></div>');

    var postSeriesHtml = postSeriesHtmlSegments.join('');
    return postSeriesHtml;
});

function isRunningInLocalServerMode() {
   return process.argv.indexOf('server') > -1 || process.argv.indexOf('s') > -1;
}
