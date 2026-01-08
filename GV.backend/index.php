<?php


	//declare(strict_types=1);

	spl_autoload_register(function ($class) {
		require __DIR__ . "/classes/$class.php";
	});

	//Carga la clase aut�noma para errores
	set_error_handler("ErrorHandler::handleError");
	set_exception_handler("ErrorHandler::handleException");


	//Toma el URL para analizar ruteo y par�metros recibidos
	$parts = explode("/", $_SERVER["REQUEST_URI"]);

	//echo "parts: ";
	//print_r($parts);

	//Levanta variables de entorno del archivo .ENV
    loadEnvVars();

	//die();

	//*============================================================= 
	// /vecorta/external_requests/VF/Class/Func/encryptedParams
	//$parts[0] = ""
	//$parts[1] = "vecorta"
	//$parts[2] = "external_requests"
	//$parts[3] = "VF"
	//*============================================================= 
	$call_class = $parts[3];
	$call_func = $parts[4];

	//Llama a la clase involucrada
	$ctrl = $call_class;

	$controller = new $ctrl();

	// $params = [];

	// $controller->processRequest($call_func, $params, $_SERVER["REQUEST_METHOD"]);

	$params = [];

		// 1. leer GET params
		if (!empty($_GET)) {
			$params = array_merge($params, $_GET);
		}

		// 2. leer POST normal params
		if (!empty($_POST)) {
			$params = array_merge($params, $_POST);
		}

		// 3. leer JSON body
		$raw = file_get_contents("php://input");
		if ($raw) {
			$json = json_decode($raw, true);
			if ($json) {
				$params = array_merge($params, $json);
			}
		}

	$controller->processRequest($call_func, $params, $_SERVER["REQUEST_METHOD"]);





//************************************************************************
// Función para cargar variables de entorno
//************************************************************************
function loadEnvVars() {
    $lines = file(__DIR__ . '/.env');
    foreach ($lines as $line) {
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        putenv(sprintf('%s=%s', $key, $value));
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

?>