<?php 

class Test {

  private PDO $connDB;

  public function __construct() {}

  public function processRequest(string $func, ?array $params, ?string $method): void {

    if (!method_exists($this, $func)) {
        http_response_code(404);
        echo json_encode(["error" => "Función no existe"]);
        return;
    }

    switch ($method) {
        case "GET":
        case "POST":
        case "PUT":
        case "DELETE":
            $this->$func($params);
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Método no permitido"]);
    }
  }


  private function init_conn(): void {
    require "includes/DB_GuiasVecorta.php";

    $db = new DB_GuiasVecorta();  
    $this->connDB = $db->getConnection();
  }

  public function Testing($params) {
    try {

      $id_reg = $params["id"] ?? null;

      $this->init_conn();

      $sql = "
        SELECT id, nombre 
        FROM secciones 
        ORDER BY nombre
      ";

      $stmt = $this->connDB->prepare($sql);
      $stmt->execute();

      $arrResult = [];

      while ($row = $stmt->fetch()) {
        $arrResult[] = [
          "id"     => $row["id"],
          "nombre" => $row["nombre"] ?? ""
        ];
      }

      echo json_encode([
        "status" => "ok",
        "data"   => $arrResult
      ]);

    } catch (Exception $e) {

      echo json_encode([
        "status"  => "error",
        "message" => "Error en Testing",
        "server"  => $e->getMessage()
      ]);
    }
  }

  // Get Secciones
  public function GetSecciones($params) {
    try {

      $this->init_conn();

      $sql = "
        SELECT *
        FROM secciones
        WHERE estado = 1
        ORDER BY created_at ASC
      ";

      $stmt = $this->connDB->prepare($sql);
      $stmt->execute();

      $arrResult = [];

      while ($row = $stmt->fetch()) {
        $arrResult[] = [
          "id"     => $row["id"],
          "nombre" => $row["nombre"] ?? ""
        ];
      }

      echo json_encode([
        "status" => "ok",
        "data"   => [
          "secciones" => $arrResult
        ]
      ]);

    } catch (Exception $e) {

      echo json_encode([
        "status"  => "error",
        "message" => "Error obteniendo secciones",
        "server"  => $e->getMessage()
      ]);
    }
  }

  // Get Secciones con Subitems
  public function GetSeccionesConSubItems($params = null) { 
    try {
        $this->init_conn();

        $sql = "
            SELECT 
                s.id   AS seccion_id,
                s.nombre AS seccion_nombre,
                si.id  AS subitem_id,
                si.nombre AS subitem_nombre
            FROM secciones s
            LEFT JOIN subitems si
                ON si.seccion_id = s.id
               AND si.estado = 1
            WHERE s.estado = 1
            ORDER BY s.id, si.id
        ";

        $stmt = $this->connDB->prepare($sql);
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $secciones = [];

        foreach ($rows as $row) {
            $sid = $row["seccion_id"];

            if (!isset($secciones[$sid])) {
                $secciones[$sid] = [
                    "id"       => $sid,
                    "nombre"   => $row["seccion_nombre"],
                    "subitems" => []
                ];
            }

            if (!empty($row["subitem_id"])) {
                $secciones[$sid]["subitems"][] = [
                    "id"     => $row["subitem_id"],
                    "nombre" => $row["subitem_nombre"]
                ];
            }
        }

        echo json_encode([
            "status" => "ok",
            "data"   => array_values($secciones)
        ]);

    } catch (Throwable $e) {

        http_response_code(500);

        echo json_encode([
            "status"  => "error",
            "message" => "Error al obtener secciones",
            "server"  => $e->getMessage()
        ]);
    }
  }


  // CREAR SECCIÓN 
  public function CreateSeccion($params) {
    try {
      if (empty($params["nombre"])) {
        throw new Exception("Falta nombre");
      }

      $this->init_conn();

      $sql = "INSERT INTO secciones (nombre, estado, created_at) VALUES (:nombre, 1, NOW())";
      $stmt = $this->connDB->prepare($sql);
      $stmt->bindValue(":nombre", $params["nombre"]);
      $stmt->execute();

      echo json_encode([
        "status" => "ok",
        "id" => $this->connDB->lastInsertId(),
        "nombre" => $params["nombre"],
        "estado" => 1
      ]);
    }
    catch (Exception $e) {
      echo json_encode([
        "status" => "error",
        "message" => "Error al crear sección"
      ]);
    }
  }


  // ELIMINAR SECCIÓN (soft delete)
  public function SoftDeleteSeccion($params) {
    try {
        $id = $params["id"] ?? null;
        if (!$id) throw new Exception("ID requerido");

        $this->init_conn();
        $this->connDB->beginTransaction();

        $sql = "UPDATE secciones SET estado = 9 WHERE id = :id";
        $stmt = $this->connDB->prepare($sql);
        $stmt->bindValue(":id", (int)$id, PDO::PARAM_INT);
        $stmt->execute();

        $sql2 = "UPDATE subitems SET estado = 9 WHERE seccion_id = :id";
        $stmt2 = $this->connDB->prepare($sql2);
        $stmt2->bindValue(":id", (int)$id, PDO::PARAM_INT);
        $stmt2->execute();

        $this->connDB->commit();

        echo json_encode(["status" => "ok"]);
    } catch (Throwable $e) {
        if ($this->connDB?->inTransaction()) {
            $this->connDB->rollBack();
        }
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
  }

  // GET SUBITEMS 
  public function GetSubItems($params) {
      try {

          // 🟢 ID DESDE LA URL
          $uri = trim($_SERVER["REQUEST_URI"], "/");
          $parts = explode("/", $uri);
          $id = end($parts);

          if (!is_numeric($id)) {
              throw new Exception("ID inválido");
          }

          $this->init_conn();

          $sql = "
              SELECT 
                  sub.id,
                  sub.nombre,
                  sub.contenido,
                  sub.created_at,
                  sub.seccion_id
              FROM subitems sub
              INNER JOIN secciones sec
                  ON sec.id = sub.seccion_id
              WHERE sub.id = :id
                AND sub.estado = 1
                AND sec.estado = 1
              LIMIT 1
          ";

          $stmt = $this->connDB->prepare($sql);
          $stmt->bindValue(":id", (int)$id, PDO::PARAM_INT);
          $stmt->execute();

          $row = $stmt->fetch(PDO::FETCH_ASSOC);

          if (!$row) {
              http_response_code(404);
              echo json_encode([
                  "status"  => "error",
                  "message" => "Subitem no encontrado"
              ]);
              return;
          }

          echo json_encode([
              "status" => "ok",
              "data"   => $row
          ]);

      } catch (Throwable $e) {

          http_response_code(500);
          echo json_encode([
              "status"  => "error",
              "message" => "Error al obtener subitem",
              "server"  => $e->getMessage()
          ]);
      }
  }

  // Crear Subitem
  public function CreateSubItem($params) {
    try {
      if (empty($params["seccion_id"]) || empty($params["nombre"])) {
        throw new Exception("Faltan datos");
      }

      $this->init_conn();

      $sql = "INSERT INTO subitems (seccion_id, nombre, estado, contenido)
              VALUES (:seccion_id, :nombre, 1, '')";

      $stmt = $this->connDB->prepare($sql);
      $stmt->bindValue(":seccion_id", $params["seccion_id"], PDO::PARAM_INT);
      $stmt->bindValue(":nombre", $params["nombre"]);
      $stmt->execute();

      echo json_encode([
        "status" => "ok",
        "id" => $this->connDB->lastInsertId(),
        "seccion_id" => $params["seccion_id"],
        "nombre" => $params["nombre"],
        "estado" => 1,
        "contenido" => ""
      ]);
    }
    catch (Exception $e) {
      echo json_encode([
        "status" => "error",
        "message" => "Error al crear subitem"
      ]);
    }
  }

  // UPDATE SUBITEM (POST)
  public function UpdateSubItem($params) {
      try {

          // 🟢 CONTENIDO (viene por POST)
          $contenido = $params["contenido"] ?? null;
          if ($contenido === null) {
              throw new Exception("Contenido no recibido");
          }

          // 🟢 ID DESDE LA URL
          $uri = $_SERVER["REQUEST_URI"];
          $parts = explode("/", trim($uri, "/"));
          $id = end($parts);

          if (!is_numeric($id)) {
              throw new Exception("ID inválido en URL");
          }

          $this->init_conn();

          $sql = "
              UPDATE subitems
              SET contenido = :contenido
              WHERE id = :id
          ";

          $stmt = $this->connDB->prepare($sql);
          $stmt->bindValue(":contenido", $contenido);
          $stmt->bindValue(":id", (int)$id, PDO::PARAM_INT);
          $stmt->execute();

          echo json_encode([
              "status" => "ok",
              "updated" => $stmt->rowCount()
          ]);

      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode([
              "status" => "error",
              "message" => $e->getMessage()
          ]);
      }
  }

  public function UpdateSubItemNombre($params) {
      try {

          $nombre = $params["nombre"] ?? null;
          if (!$nombre) {
              throw new Exception("Nombre no recibido");
          }

          // ID desde la URL
          $uri = trim($_SERVER["REQUEST_URI"], "/");
          $parts = explode("/", $uri);
          $id = end($parts);

          if (!is_numeric($id)) {
              throw new Exception("ID inválido");
          }

          $this->init_conn();

          $sql = "
              UPDATE subitems
              SET nombre = :nombre
              WHERE id = :id
          ";

          $stmt = $this->connDB->prepare($sql);
          $stmt->bindValue(":nombre", $nombre);
          $stmt->bindValue(":id", (int)$id, PDO::PARAM_INT);
          $stmt->execute();

          echo json_encode([
              "status"  => "ok",
              "updated" => $stmt->rowCount()
          ]);

      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode([
              "status"  => "error",
              "message" => $e->getMessage()
          ]);
      }
  }

  // Delete SubItem (soft delete)
  public function SoftDeleteSubItem($params) {
    try {
        $id = $params["id"] ?? null;
        if (!$id) throw new Exception("ID requerido");

        $this->init_conn();

        $sql = "UPDATE subitems SET estado = 9 WHERE id = :id";
        $stmt = $this->connDB->prepare($sql);
        $stmt->bindValue(":id", (int)$id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(["status" => "ok"]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
  }
  
  // Obtener carpetas e imágenes del directorio ImagenesGuias
  public function getListImagenes($params) {
    try {

        $folder = $params['folder'] ?? '';

        // 📁 directorio base (backend → frontend)
        $basePath = __DIR__ . '/../../GV.frontend/ImagenesGuias';

        // 🔒 seguridad básica (evitar ../)
        if (strpos($folder, '..') !== false) {
            throw new Exception("Ruta inválida");
        }

        $path = $folder ? $basePath . '/' . $folder : $basePath;

        if (!is_dir($path)) {
            throw new Exception("Directorio no encontrado");
        }

        $files = scandir($path);

        $imageExtensions = ['jpg','jpeg','png','gif','bmp','webp'];

        $folders = [];
        $images  = [];

        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;

            $fullPath = $path . '/' . $file;

            // 📁 carpetas
            if (is_dir($fullPath)) {
                $folders[] = $file;
                continue;
            }

            // 🖼 imágenes
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (in_array($ext, $imageExtensions) && is_file($fullPath)) {

                $images[] = [
                    "name" => $file,
                    // URL accesible desde el navegador
                    "url"  => '/GV.frontend/ImagenesGuias'
                            . ($folder ? '/' . $folder : '')
                            . '/' . $file
                ];
            }
        }

        echo json_encode([
            "status"  => "ok",
            "folder"  => $folder,
            "folders" => $folders,
            "images"  => $images
        ]);
    }
    catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "status"  => "error",
            "message" => "Error al obtener imágenes: " . $e->getMessage()
        ]);
    }
  }


  public function UpdateSeccionNombre($params) {
      try {

          $nombre = $params["nombre"] ?? null;
          if (!$nombre) {
              throw new Exception("Nombre no recibido");
          }

          // ID desde la URL
          $uri = trim($_SERVER["REQUEST_URI"], "/");
          $parts = explode("/", $uri);
          $id = end($parts);

          if (!is_numeric($id)) {
              throw new Exception("ID inválido");
          }

          $this->init_conn();

          $sql = "
              UPDATE secciones
              SET nombre = :nombre
              WHERE id = :id
                AND estado = 1
          ";

          $stmt = $this->connDB->prepare($sql);
          $stmt->bindValue(":nombre", $nombre);
          $stmt->bindValue(":id", (int)$id, PDO::PARAM_INT);
          $stmt->execute();

          echo json_encode([
              "status"  => "ok",
              "updated" => $stmt->rowCount()
          ]);

      } catch (Throwable $e) {
          http_response_code(500);
          echo json_encode([
              "status"  => "error",
              "message" => $e->getMessage()
          ]);
      }
  }


}


?>


