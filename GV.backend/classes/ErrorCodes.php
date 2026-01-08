<?php
class ErrorCodes {
    private static array $errorMessages = [
        // Errores de TOKEN
        'TK-001' => 'El token no es válido {INIT}',
        'TK-002' => 'Error al decodificar el payload del token {INIT}',
        'TK-003' => 'Error B al decodificar el payload del token {INIT}',
        'TK-005' => 'La firma del token no es válida {INIT}',
        'TK-010' => 'No se ha enviado el encabezado Authorization {INIT}',
        'TK-011' => 'No se ha enviado el parámetro Bearer {INIT}',

        // Errores de la clase Test
        'TST-001' => 'Error de base de datos {Testing}',

        // Errores de la clase ...
        
    ];

    public static function getError(string $code): string {
        return self::$errorMessages[$code] ?? 'Error desconocido';
    }
}
?>