import {
  CanvasConnection,
  DrawingObject,
  LearningStep,
  ScoreResult,
  ValidationResult,
  ValidationRule,
} from "@/lib/types";

/**
 * Validation Engine für die Überprüfung von Canvas-Aufgaben
 */

export function validateStep(
  step: LearningStep,
  objects: DrawingObject[],
  connections: CanvasConnection[],
): ScoreResult {
  const rules = step.validationRules || [];
  const results: ValidationResult[] = rules.map((rule) =>
    validateRule(rule, objects, connections),
  );

  const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
  const maxPoints = rules.reduce((sum, r) => sum + r.points, 0);
  const percentage =
    maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 100;

  return {
    totalPoints,
    maxPoints,
    percentage,
    passed: percentage >= 70, // Default 70% passing threshold
    results,
    completedAt: Date.now(),
  };
}

function validateRule(
  rule: ValidationRule,
  objects: DrawingObject[],
  connections: CanvasConnection[],
): ValidationResult {
  switch (rule.type) {
    case "shape-exists":
      return validateShapeExists(rule, objects);
    case "shape-configured":
      return validateShapeConfigured(rule, objects);
    case "connection-exists":
      return validateConnectionExists(rule, objects, connections);
    case "status-check":
      return validateStatusCheck(rule, objects);
    default:
      return {
        ruleId: rule.id,
        passed: false,
        message: `Unbekannter Regeltyp: ${rule.type}`,
        points: 0,
      };
  }
}

function validateShapeExists(
  rule: ValidationRule,
  objects: DrawingObject[],
): ValidationResult {
  const shapeType = rule.shapeType?.toLowerCase();
  const found = objects.some(
    (obj) =>
      obj.type === "shape" &&
      (obj.shapeId?.toLowerCase().includes(shapeType || "") ||
        obj.label?.toLowerCase().includes(shapeType || "")),
  );

  return {
    ruleId: rule.id,
    passed: found,
    message: found
      ? `Shape "${rule.shapeType}" gefunden`
      : `Shape "${rule.shapeType}" nicht gefunden`,
    points: found ? rule.points : 0,
  };
}

function validateShapeConfigured(
  rule: ValidationRule,
  objects: DrawingObject[],
): ValidationResult {
  const shapeType = rule.shapeType?.toLowerCase();
  const matchingShapes = objects.filter(
    (obj) =>
      obj.type === "shape" &&
      (obj.shapeId?.toLowerCase().includes(shapeType || "") ||
        obj.label?.toLowerCase().includes(shapeType || "")),
  );

  if (matchingShapes.length === 0) {
    return {
      ruleId: rule.id,
      passed: false,
      message: `Shape "${rule.shapeType}" nicht gefunden`,
      points: 0,
    };
  }

  const expectedConfig = rule.expectedConfig;
  if (!expectedConfig) {
    // Just check that config exists
    const hasConfig = matchingShapes.some(
      (obj) => obj.config && Object.keys(obj.config).length > 0,
    );
    return {
      ruleId: rule.id,
      passed: hasConfig,
      message: hasConfig
        ? `Shape "${rule.shapeType}" ist konfiguriert`
        : `Shape "${rule.shapeType}" hat keine Konfiguration`,
      points: hasConfig ? rule.points : 0,
    };
  }

  // Check specific config values
  const configured = matchingShapes.some((obj) => {
    if (!obj.config) return false;
    return Object.entries(expectedConfig).every(([key, value]) => {
      const configValue = (obj.config as Record<string, unknown>)?.[key];
      if (typeof value === "string") {
        return String(configValue).toLowerCase() === value.toLowerCase();
      }
      return configValue === value;
    });
  });

  return {
    ruleId: rule.id,
    passed: configured,
    message: configured
      ? `Shape "${rule.shapeType}" korrekt konfiguriert`
      : `Shape "${rule.shapeType}" nicht korrekt konfiguriert`,
    points: configured ? rule.points : 0,
  };
}

function validateConnectionExists(
  rule: ValidationRule,
  objects: DrawingObject[],
  connections: CanvasConnection[],
): ValidationResult {
  const sourceLabel = rule.sourceShapeLabel?.toLowerCase();
  const targetLabel = rule.targetShapeLabel?.toLowerCase();

  // Find source and target shapes by label
  const sourceShapes = objects.filter(
    (obj) =>
      obj.type === "shape" &&
      (obj.label?.toLowerCase().includes(sourceLabel || "") ||
        obj.shapeId?.toLowerCase().includes(sourceLabel || "")),
  );
  const targetShapes = objects.filter(
    (obj) =>
      obj.type === "shape" &&
      (obj.label?.toLowerCase().includes(targetLabel || "") ||
        obj.shapeId?.toLowerCase().includes(targetLabel || "")),
  );

  if (sourceShapes.length === 0 || targetShapes.length === 0) {
    return {
      ruleId: rule.id,
      passed: false,
      message: `Verbindung: Source oder Target Shape nicht gefunden`,
      points: 0,
    };
  }

  const sourceIds = new Set(sourceShapes.map((s) => s.id));
  const targetIds = new Set(targetShapes.map((t) => t.id));

  const found = connections.some(
    (conn) =>
      (sourceIds.has(conn.sourceShapeId) &&
        targetIds.has(conn.targetShapeId)) ||
      (sourceIds.has(conn.targetShapeId) && targetIds.has(conn.sourceShapeId)),
  );

  return {
    ruleId: rule.id,
    passed: found,
    message: found
      ? `Verbindung zwischen "${rule.sourceShapeLabel}" und "${rule.targetShapeLabel}" gefunden`
      : `Verbindung zwischen "${rule.sourceShapeLabel}" und "${rule.targetShapeLabel}" fehlt`,
    points: found ? rule.points : 0,
  };
}

function validateStatusCheck(
  rule: ValidationRule,
  objects: DrawingObject[],
): ValidationResult {
  const shapeType = rule.shapeType?.toLowerCase();
  const expectedStatus = rule.expectedStatus;

  const matchingShapes = objects.filter(
    (obj) =>
      obj.type === "shape" &&
      (obj.shapeId?.toLowerCase().includes(shapeType || "") ||
        obj.label?.toLowerCase().includes(shapeType || "")),
  );

  if (matchingShapes.length === 0) {
    return {
      ruleId: rule.id,
      passed: false,
      message: `Shape "${rule.shapeType}" nicht gefunden`,
      points: 0,
    };
  }

  const statusMatch = matchingShapes.some(
    (obj) => obj.status === expectedStatus,
  );

  return {
    ruleId: rule.id,
    passed: statusMatch,
    message: statusMatch
      ? `Shape "${rule.shapeType}" hat Status "${expectedStatus}"`
      : `Shape "${rule.shapeType}" hat nicht den erwarteten Status "${expectedStatus}"`,
    points: statusMatch ? rule.points : 0,
  };
}

/**
 * Berechne den Gesamtscore mit Hint-Abzügen
 */
export function calculateScoreWithHints(
  baseScore: ScoreResult,
  hintsUsed: string[],
  allHints: { id: string; pointsDeduction: number }[],
): ScoreResult {
  const hintDeduction = hintsUsed.reduce((sum, hintId) => {
    const hint = allHints.find((h) => h.id === hintId);
    return sum + (hint?.pointsDeduction || 0);
  }, 0);

  const adjustedPoints = Math.max(0, baseScore.totalPoints - hintDeduction);
  const percentage =
    baseScore.maxPoints > 0
      ? Math.round((adjustedPoints / baseScore.maxPoints) * 100)
      : 0;

  return {
    ...baseScore,
    totalPoints: adjustedPoints,
    percentage,
    passed: percentage >= 70,
  };
}
