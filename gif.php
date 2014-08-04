<?php
try {
        $db = new PDO("mysql:dbname=db;host=localhost", "user", "password");
        $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die( $e->getMessage() );
}

if(isset($_GET['id'])) {
	$id = $_GET['id'];

	$sth = $db->prepare('SELECT COUNT(*) FROM gifs WHERE hash=?');
	$sth->bindParam(1, $id);
	$sth->execute();

	if($sth->fetchColumn()) {
		$src =  "http://s3.amazonaws.com/i.nu.cm/c/$id";
		echo "
		<!doctype html>
		<html>
			<head>
				<link rel=\"alternate\" type=\"application/json+oembed\" href=\"http://gif.nu.cm/oembed/$id\" title=\"nu.cm oEmbed Profile\" />
			</head>
			<body>
				<video  autoplay=\"autoplay\" loop> 
					<source src=\"$src.webm\" type=\"video/webm\">
					<source id=\"video1\" src=\"$src.mp4\" type=\"video/mp4\">
					Update your browser.
				</video>
			                  
</body></html>
		";
	}

} else if(isset($_GET['oembed'])) {
	$id = $_GET['oembed'];
	
	$sth = $db->prepare('SELECT COUNT(*) FROM gifs WHERE hash=?');
	$sth->bindParam(1, $id);
	$sth->execute();


	if($sth->fetchColumn()) {
	header('Content-Type:application/json');
echo '{"version":"1.0","type":"video","provider_name":"http:\/\/gif.nu.cm","width":640,"height":360,"title":null,"html": "\u003Ciframe src=\u0027http:\/\/gif.nu.cm\/iframe\/' . $id . '\u0027 frameborder=\u00270\u0027 scrolling=\u0027no\u0027 width=\u0027788\u0027 height=\u0027444\u0027 style=\u0027-webkit-backface-visibility: hidden;-webkit-transform: scale(1);\u0027 \u003E\u003C\/iframe\u003E\u0027"}';
	}
	
} else if(isset($_GET['iframe'])) {
	$id = $_GET['iframe'];

	$sth = $db->prepare('SELECT COUNT(*) FROM gifs WHERE hash=?');
	$sth->bindParam(1, $id);
	$sth->execute();

	if($sth->fetchColumn()) {
		$src =  "http://s3.amazonaws.com/i.nu.cm/c/$id";
		echo "
		<!doctype html>
		<html>
			<head>
				<style>
					body,html{margin:0px;padding:0px;}
				</style>
			</head>
			<body>
				<a href=\"http://gif.nu.cm/$id\">
					<video autoplay=\"autoplay\" loop> 
						<source src=\"$src.mp4\" type=\"video/mp4\">
						<source src=\"$src.webm\" type=\"video/webm\">
						Update your browser.
					</video>
				</a>
			</body>
		</html>
		";
	}
}
?>
