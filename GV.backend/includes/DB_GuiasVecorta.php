<?php

class DB_GuiasVecorta {

	private string $host;
	private string $port;
	private string $db;
    private string $user;
    private string $password;


    public function __construct() 
    {
		$this->host = $_ENV['DB_HOST'];
		$this->port = $_ENV['DB_PORT'];
		$this->db = $_ENV['DB_GUIASVECORTA'];
		$this->user = $_ENV['DB_GUIASVECORTA_USER'];
		$this->password = $_ENV['DB_GUIASVECORTA_PASS'];
		
	}
        
    public function getConnection(): PDO
    {
        $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db};charset=utf8";
        
        return new PDO($dsn, $this->user, $this->password, [
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_STRINGIFY_FETCHES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET time_zone = 'America/Argentina/Buenos_Aires'"
        ]);
    }
}

?>