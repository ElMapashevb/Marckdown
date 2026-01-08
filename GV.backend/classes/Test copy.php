<?php 

// version de eliminar seccion y eliminar subItem al estado 9
public function DeleteSeccion($params) {
    try {
      $id = $params["id"] ?? null;
      if (!$id) throw new Exception("ID requerido");

      $this->init_conn();

      $sql = "
        UPDATE secciones
        SET estado = 9
        WHERE id = :id
      ";

      $stmt = $this->connDB->prepare($sql);
      $stmt->bindValue(":id", $id, PDO::PARAM_INT);
      $stmt->execute();

      echo json_encode([
        "status"  => "ok",
        "message" => "Sección eliminada (estado = 9)"
      ]);

    } catch (Exception $e) {
      echo json_encode([
        "status"  => "error",
        "message" => "Error al eliminar sección",
        "server"  => $e->getMessage()
      ]);
    }
  }

   public function DeleteSubItem($params) {
    try {
      $id = $params["id"] ?? null;
      if (!$id) throw new Exception("ID requerido");

      $this->init_conn();

      $sql = "
        UPDATE subitems
        SET estado = 9
        WHERE id = :id
      ";

      $stmt = $this->connDB->prepare($sql);
      $stmt->bindValue(":id", $id, PDO::PARAM_INT);
      $stmt->execute();

      echo json_encode([
        "status"  => "ok",
        "message" => "Subitem eliminado (estado = 9)"
      ]);

    } catch (Exception $e) {
      echo json_encode([
        "status"  => "error",
        "message" => "Error al eliminar subitem",
        "server"  => $e->getMessage()
      ]);
    }
  }














class Test {

  private PDO $connDB;

  public function __construct() {}

  public function processRequest(string $func, ?array $params, ?string $method): void {
    $this->$func($params); 
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

      $sql = "SELECT id, nombre 
              FROM secciones 
              ORDER BY nombre";

      $stmt = $this->connDB->prepare($sql);
      $stmt->execute();

      $arrResult = [];
      while ($row = $stmt->fetch()) {
        $arrResult[] = [
          "id" => $row["id"],
          "nombre" => $row["nombre"] ?? "", 
        ];
      }

      echo json_encode([
        "status" => "ok",
        "data" => $arrResult
      ]);

    } 
    catch (Exception $e) {

      echo json_encode([
        "status" => "error",
        "message" => "Error en Testing",
        "server" => $e->getMessage()
      ]);
    }
  }
  public function GetSecciones($params) {
    try {

      $this->init_conn();

      $sql = "SELECT id, nombre 
              FROM secciones 
              ORDER BY nombre";

      $stmt = $this->connDB->prepare($sql);
      $stmt->execute();

      $arrResult = [];
      while ($row = $stmt->fetch()) {
        $arrResult[] = [
          "id" => $row["id"],
          "nombre" => $row["nombre"] ?? "", 
        ];
      }

      echo json_encode([
        "status" => "ok",
        "data" => $arrResult
      ]);

    } 
    catch (Exception $e) {

      echo json_encode([
        "status" => "error",
        "message" => "Error obteniendo secciones",
        "server" => $e->getMessage()
      ]);
    }
  }

  // ELIMINAR SECCIÓN
  public function DeleteSeccion($params) {
    try {
      $id = $params["id"] ?? null;
      if (!$id) throw new Exception("ID requerido");

      $this->init_conn();

      $sql = "DELETE FROM secciones WHERE id = :id";
      $stmt = $this->connDB->prepare($sql);
      $stmt->bindValue(":id", $id, PDO::PARAM_INT);
      $stmt->execute();

      echo json_encode([
        "status" => "ok"
      ]);
    }
    catch (Exception $e) {
      echo json_encode([
        "status" => "error",
        "message" => "Error al eliminar sección"
      ]);
    }
  }

  /*
  public function GetSeccionesConSubitems($params) {
      try {
        $this->init_conn();

        $sqlSec = "SELECT * FROM secciones ORDER BY id"; // despues cambiar por orden
        $stmtSec = $this->connDB->prepare($sqlSec);
        $stmtSec->execute();
        $secciones = $stmtSec->fetchAll(PDO::FETCH_ASSOC);

        foreach ($secciones as $s) {
          $sec = [
            "id" => $s["id"],
            "nombre" => $s["nombre"],
            "created_at" => $s["created_at"],
            "subitems" => []
          ];
        }

        $sqlSub = "SELECT * FROM subitems ORDER BY id";
        $stmtSub = $this->connDB->prepare($sqlSub);
        $stmtSub->execute();

        $subitems  = $stmtSub->fetchAll(PDO::FETCH_ASSOC);

        $result = [];


          foreach ($subitems as $si) {
            if ($si["seccion_id"] == $s["id"]) {
              $sec["subitems"][] = [
                "id" => $si["id"],
                "nombre" => $si["nombre"],
                "contenido" => $si["contenido"],
                "created_at" => $si["created_at"]
              ];
            }
          }

          $result[] = $sec;
        }

        echo json_encode([
          "status" => "ok",
          "data" => $result
        ]);
      }
      catch (Exception $e) {
        echo json_encode([
          "status" => "error",
          "message" => "Error al obtener secciones"
        ]);
      }
    }
*/




/*


  

  // CREAR SECCIÓN 
  public function CreateSeccion($params) {
    try {
      if (empty($params["nombre"])) {
        throw new Exception("Falta nombre");
      }

      $this->init_conn();

      $sql = "INSERT INTO secciones (nombre, created_at) VALUES (:nombre, NOW())";
      $stmt = $this->connDB->prepare($sql);
      $stmt->bindValue(":nombre", $params["nombre"]);
      $stmt->execute();

      echo json_encode([
        "status" => "ok",
        "id" => $this->connDB->lastInsertId(),
        "nombre" => $params["nombre"]
      ]);
    }
    catch (Exception $e) {
      echo json_encode([
        "status" => "error",
        "message" => "Error al crear sección"
      ]);
    }
  }

  // ELIMINAR SECCIÓN
  public function DeleteSeccion($params) {
    try {
      $id = $params["id"] ?? null;
      if (!$id) throw new Exception("ID requerido");

      $this->init_conn();

      $sql = "DELETE FROM secciones WHERE id = :id";
      $stmt = $this->connDB->prepare($sql);
      $stmt->bindValue(":id", $id, PDO::PARAM_INT);
      $stmt->execute();

      echo json_encode([
        "status" => "ok"
      ]);
    }
    catch (Exception $e) {
      echo json_encode([
        "status" => "error",
        "message" => "Error al eliminar sección"
      ]);
    }
  }


  // GET SUBITEMS 
  public function GetSubItems($params) {
    try {
      $id = $params["id"] ?? null;
      if (!$id) throw new Exception("ID requerido");

      $this->init_conn();

      $sql = "SELECT * FROM subitems WHERE id = :id";
      $stmt = $this->connDB->prepare($sql);
      $stmt->bindValue(":id", $id, PDO::PARAM_INT);
      $stmt->execute();

      $row = $stmt->fetch(PDO::FETCH_ASSOC);

      if (!$row) {
        echo json_encode([
          "status" => "error",
          "message" => "No encontrado"
        ]);
        return;
      }

      echo json_encode([
        "status" => "ok",
        "data" => $row
      ]);
    }
    catch (Exception $e) {
      echo json_encode([
        "status" => "error",
        "message" => "Error al obtener subitem"
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

      $sql = "INSERT INTO subitems (seccion_id, nombre, contenido)
              VALUES (:seccion_id, :nombre, '')";

      $stmt = $this->connDB->prepare($sql);
      $stmt->bindValue(":seccion_id", $params["seccion_id"], PDO::PARAM_INT);
      $stmt->bindValue(":nombre", $params["nombre"]);
      $stmt->execute();

      echo json_encode([
        "status" => "ok",
        "id" => $this->connDB->lastInsertId(),
        "seccion_id" => $params["seccion_id"],
        "nombre" => $params["nombre"],
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

    // UPDATE SUBITEM
  public function UpdateSubItem($params) {
    try {
      $id = $params["id"] ?? null;
      if (!$id) throw new Exception("ID requerido");

      $this->init_conn();

      if (isset($params["contenido"]) && isset($params["nombre"])) {
        $sql = "UPDATE subitems SET contenido = :contenido, nombre = :nombre WHERE id = :id";
      }
      elseif (isset($params["contenido"])) {
        $sql = "UPDATE subitems SET contenido = :contenido WHERE id = :id";
      }
      elseif (isset($params["nombre"])) {
        $sql = "UPDATE subitems SET nombre = :nombre WHERE id = :id";
      }
      else {
        throw new Exception("Nada para actualizar");
      }

      $stmt = $this->connDB->prepare($sql);
      $stmt->bindValue(":id", $id, PDO::PARAM_INT);
      if (isset($params["contenido"])) $stmt->bindValue(":contenido", $params["contenido"]);
      if (isset($params["nombre"])) $stmt->bindValue(":nombre", $params["nombre"]);

      $stmt->execute();

      echo json_encode([
        "status" => "ok"
      ]);
    }
    catch (Exception $e) {
      echo json_encode([
        "status" => "error",
        "message" => "Error al actualizar subitem"
      ]);
    }
  }

  //Delete SubItem
  public function DeleteSubItem($params) {
    try {
      $id = $params["id"] ?? null;
      if (!$id) throw new Exception("ID requerido");

      $this->init_conn();

      $sql = "DELETE FROM subitems WHERE id = :id";
      $stmt = $this->connDB->prepare($sql);
      $stmt->bindValue(":id", $id, PDO::PARAM_INT);
      $stmt->execute();

      echo json_encode([
        "status" => "ok"
      ]);
    }
    catch (Exception $e) {
      echo json_encode([
        "status" => "error",
        "message" => "Error al eliminar subitem"
      ]);
    }
  }


*/

?>