function toBool(value) {
    return value === true || value === 1 || value === "1";
}

function getMaterialStep(unit) {
    if (!unit) return 0.01;

    const normalized = String(unit).toLowerCase();

    if (["szt", "szt.", "pcs", "pc"].includes(normalized)) return 1;
    if (["kg", "g", "l", "m", "m2", "m3", "mb"].includes(normalized)) return 0.001;

    return 0.01;
}

export function processesDto(data) {
    if (!Array.isArray(data)) return [];

    return data.map((item) => {
        const details = item?.details ?? {};

        const machines = Array.isArray(item?.machines)
            ? item.machines.map((machine) => {
                  const machineDetails = machine?.details ?? {};

                  return {
                      id: machineDetails.id ?? null,
                      name: machineDetails.name ?? null,
                      active: toBool(machineDetails.is_active),
                      operational: toBool(machineDetails.is_operational),
                      required: toBool(machine?.is_required),
                  };
              })
            : [];

        const materials = Array.isArray(item?.materials)
            ? item.materials.map((material) => {
                  const materialDetails = material?.details ?? {};
                  const unit = materialDetails.unit ?? null;

                  return {
                      id: materialDetails.id ?? null,
                      name: materialDetails.name ?? null,
                      active: toBool(materialDetails.is_active),
                      required: toBool(material?.is_required),
                      unit,
                      step: getMaterialStep(unit),
                  };
              })
            : [];

        return {
            id: details.id ?? null,
            name: details.name ?? null,
            description: details.description ?? null,
            active: toBool(details.is_active),
            is_general: toBool(details.is_general),
            is_design: toBool(details.is_design),
            is_setup: toBool(details.is_setup),
            is_task: toBool(details.is_task),
            requires_quantity: toBool(details.requires_quantity),
            requires_remarks: toBool(details.requires_remarks),
            machines,
            materials,
        };
    });
}