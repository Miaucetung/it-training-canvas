import { CLOUD_PRICING, detectCloudProvider } from "@/lib/network-simulator";
import { CloudResource, CostEstimate, DrawingObject } from "@/lib/types";
import {
  ArrowsClockwise,
  Cloud,
  CurrencyDollar,
  Plus,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface CostCalculatorProps {
  objects: DrawingObject[];
  onClose: () => void;
  theme: "light" | "dark";
}

export function CostCalculator({
  objects,
  onClose,
  theme,
}: CostCalculatorProps) {
  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-slate-800/50" : "bg-slate-50";
  const inputBg = isDark ? "bg-slate-800" : "bg-slate-50";

  const shapes = useMemo(
    () => objects.filter((obj) => obj.type === "shape"),
    [objects],
  );

  const [resources, setResources] = useState<CloudResource[]>([]);
  const [currency] = useState("USD");

  // Auto-detect resources from canvas shapes
  const autoDetect = useCallback(() => {
    const detected: CloudResource[] = shapes.map((shape) => {
      const provider = detectCloudProvider(shape);
      const pricing = CLOUD_PRICING[provider];
      const tiers = pricing ? Object.keys(pricing) : [];
      const defaultTier = tiers[0] || "custom";
      const tierData = pricing?.[defaultTier];

      return {
        id: `res-${shape.id}`,
        shapeId: shape.id,
        provider,
        service: shape.shapeId || "Compute",
        tier: defaultTier,
        region: shape.config?.region || "eu-central-1",
        monthlyCostUsd: tierData?.monthly || 0,
        hourlyCostUsd: tierData?.hourly || 0,
        specs: {
          vcpu: tierData?.vcpu || shape.config?.cpu || 1,
          memoryGb: tierData?.memGb || shape.config?.memory || 1,
          storageGb: shape.config?.storage || 20,
        },
      };
    });
    setResources(detected);
  }, [shapes]);

  useEffect(() => {
    if (resources.length === 0 && shapes.length > 0) {
      autoDetect();
    }
  }, [shapes.length]);

  const estimate = useMemo<CostEstimate>(() => {
    const totalMonthly = resources.reduce(
      (sum, r) => sum + r.monthlyCostUsd,
      0,
    );
    return {
      resources,
      totalMonthlyCost: Math.round(totalMonthly * 100) / 100,
      totalYearlyCost: Math.round(totalMonthly * 12 * 100) / 100,
      currency,
      lastUpdated: Date.now(),
    };
  }, [resources, currency]);

  const updateResource = useCallback(
    (id: string, updates: Partial<CloudResource>) => {
      setResources((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const updated = { ...r, ...updates };
          // Auto-update cost when tier changes
          if (updates.tier && CLOUD_PRICING[updated.provider]?.[updates.tier]) {
            const tierData = CLOUD_PRICING[updated.provider][updates.tier];
            updated.monthlyCostUsd = tierData.monthly;
            updated.hourlyCostUsd = tierData.hourly;
            updated.specs = {
              ...updated.specs,
              vcpu: tierData.vcpu || updated.specs.vcpu,
              memoryGb: tierData.memGb || updated.specs.memoryGb,
            };
          }
          return updated;
        }),
      );
    },
    [],
  );

  const removeResource = useCallback((id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addResource = useCallback(() => {
    setResources((prev) => [
      ...prev,
      {
        id: `res-manual-${Date.now()}`,
        shapeId: "",
        provider: "aws",
        service: "Custom",
        tier: "t3.micro",
        region: "eu-central-1",
        monthlyCostUsd: 7.59,
        hourlyCostUsd: 0.0104,
        specs: { vcpu: 2, memoryGb: 1, storageGb: 20 },
      },
    ]);
  }, []);

  const PROVIDER_COLORS: Record<string, string> = {
    aws: "text-amber-400",
    azure: "text-blue-400",
    gcp: "text-red-400",
    "on-premise": "text-slate-400",
  };

  const PROVIDER_LABELS: Record<string, string> = {
    aws: "AWS",
    azure: "Azure",
    gcp: "GCP",
    "on-premise": "On-Premise",
  };

  // Cost breakdown by provider
  const costByProvider = useMemo(() => {
    const breakdown: Record<string, number> = {};
    resources.forEach((r) => {
      breakdown[r.provider] = (breakdown[r.provider] || 0) + r.monthlyCostUsd;
    });
    return breakdown;
  }, [resources]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative ml-auto w-[750px] max-w-full h-full ${bg} ${border} border-l flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${border}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CurrencyDollar size={20} className="text-green-400" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${text}`}>
                Cloud Cost Calculator
              </h2>
              <p className={`text-xs ${textMuted}`}>
                {resources.length} Ressourcen erkannt
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={autoDetect}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${textMuted} hover:text-indigo-400 transition-colors`}
              title="Shapes neu erkennen"
            >
              <ArrowsClockwise size={14} /> Neu erkennen
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-slate-700/50 ${textMuted}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className={`px-6 py-4 border-b ${border} grid grid-cols-3 gap-3`}>
          <div className={`p-4 rounded-xl ${cardBg} border ${border}`}>
            <p className={`text-xs ${textMuted} mb-1`}>Monatlich</p>
            <p className={`text-2xl font-bold ${text}`}>
              ${estimate.totalMonthlyCost.toFixed(2)}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${cardBg} border ${border}`}>
            <p className={`text-xs ${textMuted} mb-1`}>Jährlich</p>
            <p className={`text-2xl font-bold ${text}`}>
              ${estimate.totalYearlyCost.toFixed(2)}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${cardBg} border ${border}`}>
            <p className={`text-xs ${textMuted} mb-1`}>Anbieter</p>
            <div className="space-y-1 mt-1">
              {Object.entries(costByProvider).map(([provider, cost]) => (
                <div
                  key={provider}
                  className="flex items-center justify-between text-xs"
                >
                  <span className={PROVIDER_COLORS[provider]}>
                    {PROVIDER_LABELS[provider]}
                  </span>
                  <span className={text}>${cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resource List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {resources.map((resource) => {
            const shape = objects.find((o) => o.id === resource.shapeId);
            const pricing = CLOUD_PRICING[resource.provider] || {};
            const tiers = Object.keys(pricing);

            return (
              <div
                key={resource.id}
                className={`p-4 rounded-xl ${cardBg} border ${border}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
                    <Cloud
                      size={16}
                      className={PROVIDER_COLORS[resource.provider]}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-sm font-medium ${text}`}>
                          {shape?.label || shape?.shapeId || resource.service}
                        </span>
                        <span
                          className={`ml-2 text-xs ${PROVIDER_COLORS[resource.provider]}`}
                        >
                          {PROVIDER_LABELS[resource.provider]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${text}`}>
                          ${resource.monthlyCostUsd.toFixed(2)}/mo
                        </span>
                        <button
                          onClick={() => removeResource(resource.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-500/10"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Config row */}
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={resource.provider}
                        onChange={(e) =>
                          updateResource(resource.id, {
                            provider: e.target
                              .value as CloudResource["provider"],
                            tier:
                              Object.keys(
                                CLOUD_PRICING[e.target.value] || {},
                              )[0] || "custom",
                          })
                        }
                        className={`px-2 py-1 rounded text-xs ${inputBg} ${text} border ${border}`}
                      >
                        <option value="aws">AWS</option>
                        <option value="azure">Azure</option>
                        <option value="gcp">GCP</option>
                        <option value="on-premise">On-Premise</option>
                      </select>

                      <select
                        value={resource.tier}
                        onChange={(e) =>
                          updateResource(resource.id, { tier: e.target.value })
                        }
                        className={`px-2 py-1 rounded text-xs ${inputBg} ${text} border ${border}`}
                      >
                        {tiers.map((tier) => (
                          <option key={tier} value={tier}>
                            {tier} (${pricing[tier].monthly}/mo)
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={resource.region}
                        onChange={(e) =>
                          updateResource(resource.id, {
                            region: e.target.value,
                          })
                        }
                        className={`w-28 px-2 py-1 rounded text-xs ${inputBg} ${text} border ${border}`}
                        placeholder="Region"
                      />
                    </div>

                    {/* Specs */}
                    <div className={`flex gap-4 text-xs ${textMuted}`}>
                      {resource.specs.vcpu ? (
                        <span>{resource.specs.vcpu} vCPU</span>
                      ) : null}
                      {resource.specs.memoryGb ? (
                        <span>{resource.specs.memoryGb} GB RAM</span>
                      ) : null}
                      {resource.specs.storageGb ? (
                        <span>{resource.specs.storageGb} GB Storage</span>
                      ) : null}
                      <span className={`${textMuted}`}>
                        ${resource.hourlyCostUsd.toFixed(4)}/hr
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {resources.length === 0 && (
            <div className={`text-center py-12 ${textMuted}`}>
              <Cloud size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Keine Ressourcen erkannt</p>
              <p className="text-xs mt-1">
                Platziere Cloud-Shapes auf dem Canvas
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t ${border} flex items-center justify-between`}
        >
          <button
            onClick={addResource}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${textMuted} hover:text-white hover:bg-slate-700/50 transition-colors`}
          >
            <Plus size={14} /> Ressource hinzufügen
          </button>
          <div className={`text-xs ${textMuted}`}>
            Preise sind Schätzungen (US East, On-Demand)
          </div>
        </div>
      </div>
    </div>
  );
}
